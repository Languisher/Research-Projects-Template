#!/usr/bin/env python3
"""Connect project notes to private <English-name>-Proposal repositories."""
import argparse
import fcntl
import json
import os
import re
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

CONFIG = 'project-repositories.json'

def copy_content(source, target):
    # iCloud placeholders may reject native clonefile/copyfile; stream actual bytes.
    with open(source, 'rb') as src, open(target, 'wb') as dst:
        shutil.copyfileobj(src, dst, length=1024*1024)
    os.chmod(target, os.stat(source).st_mode & 0o777)
    return str(target)

def run(args, cwd, check=True):
    env = os.environ.copy()
    env['PATH'] = os.pathsep.join(['/opt/homebrew/bin', '/usr/local/bin', env.get('PATH', ''), '/usr/bin', '/bin'])
    for key in ('GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE'):
        env.pop(key, None)
    result = subprocess.run(args, cwd=cwd, env=env, text=True, capture_output=True, timeout=900)
    if check and result.returncode:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip() or 'Command failed')
    return result

def git(cwd, *args, check=True):
    return run(['git', '-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', *args], cwd, check)

def project_name(name):
    if not name or name.startswith(('.', '_')) or any(c in name for c in '/\\\n\r\0'):
        raise ValueError('Project must be a direct, non-reserved child of 02 Projects.')
    return name

def repo_name(name):
    slug = re.sub(r'\s+', '-', project_name(name).strip())
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*', slug):
        raise ValueError('Provide an English repository name for this project.')
    if not slug.endswith('-Proposal'):
        slug += '-Proposal'
    if len(slug) > 100:
        raise ValueError('GitHub repository name exceeds 100 characters.')
    return slug

def reserve(config, name, repo):
    project_name(name)
    repo = repo_name(repo)
    previous = config['projects'].get(name)
    if previous and previous != repo:
        raise ValueError('Project already maps to another repository; rename explicitly instead.')
    for other, existing in config['projects'].items():
        if other != name and existing.casefold() == repo.casefold():
            raise ValueError('Two projects cannot share the same repository.')
    config['projects'][name] = repo
    return repo

def save_config(vault, config):
    temporary = vault/(CONFIG+'.tmp')
    temporary.write_text(json.dumps(config, ensure_ascii=False, indent=2)+'\n')
    temporary.replace(vault/CONFIG)

def tracked_files(clone):
    return [p for p in git(clone, 'ls-files', '-z').stdout.split('\0') if p]

def import_existing(project, clone):
    """Advance known historical copies; stop before writing any divergent files."""
    writes, conflicts, unresolved, anchors = [], [], [], []
    for rel in tracked_files(clone):
        source, target = clone/rel, project/rel
        if source.is_symlink():
            raise RuntimeError('Symlink in imported repository requires manual review: '+rel)
        if target.is_symlink():
            raise RuntimeError('Local symlink requires manual review: '+rel)
        if not target.exists():
            writes.append((source, target))
        elif not target.is_file():
            conflicts.append(rel)
        elif source.read_bytes() != target.read_bytes():
            local_blob = git(clone, 'hash-object', str(target)).stdout.strip()
            commits = git(clone, 'log', '--format=%H', '--', rel).stdout.splitlines()
            historical = {rev for rev in commits if git(clone, 'rev-parse', rev+':'+rel, check=False).stdout.strip() == local_blob}
            if historical:
                anchors.append(historical)
                writes.append((source, target))
            else:
                unresolved.append(rel)
    # A shared older snapshot also identifies local edits to files untouched upstream.
    common = set.intersection(*anchors) if anchors else set()
    anchor = next((rev for rev in git(clone, 'log', '--topo-order', '--format=%H').stdout.splitlines() if rev in common), None)
    for rel in unresolved:
        old = git(clone, 'rev-parse', anchor+':'+rel, check=False).stdout.strip() if anchor else None
        current = git(clone, 'rev-parse', 'HEAD:'+rel).stdout.strip()
        if old != current:
            conflicts.append(rel)
    if conflicts:
        raise RuntimeError('Local/remote content diverges; nothing imported: '+', '.join(conflicts))
    for source, target in writes:
        target.parent.mkdir(parents=True, exist_ok=True)
        copy_content(source, target)

def register(vault, name, repo, url):
    rel = '02 Projects/'+name
    for key, value in [('path', rel), ('url', url), ('branch', 'main')]:
        git(vault, 'config', '-f', '.gitmodules', 'submodule.'+repo+'.'+key, value)
    git(vault, 'config', 'submodule.'+repo+'.url', url)
    git(vault, 'add', '--', '.gitmodules', rel)
    git(vault, 'submodule', 'absorbgitdirs', '--', rel)

def note_repository(project, name, url):
    note = project/(name+'.md')
    text = note.read_text()
    match = re.match(r'\A---\r?\n(.*?)\r?\n---', text, re.S)
    if not match:
        raise ValueError('Project homepage has no YAML frontmatter: '+str(note))
    header = match.group(1)
    line = 'repository: '+json.dumps(url)
    if re.search(r'^repository:', header, re.M):
        header = re.sub(r'^repository:.*$', lambda _: line, header, flags=re.M)
    else:
        header += '\n'+line
    note.write_text('---\n'+header+'\n---'+text[match.end():])

def restore_gitfile(vault, project, repo):
    """Recover a missing submodule gitfile without checking out or changing notes."""
    if (project/'.git').exists():
        return
    location = Path(git(vault, 'rev-parse', '--git-path', 'modules/'+repo).stdout.strip())
    module = location if location.is_absolute() else vault/location
    if not module.is_dir():
        return
    worktree = git(vault, '--git-dir='+str(module), 'config', '--get', 'core.worktree').stdout.strip()
    if (module/worktree).resolve() != project.resolve():
        raise RuntimeError('Existing submodule metadata points to another worktree.')
    (project/'.git').write_text('gitdir: '+os.path.relpath(module, project)+'\n')

def provision(vault, config, name, repo, seed=None, parent_commit=True):
    project_name(name)
    project = vault/'02 Projects'/name
    if project.is_symlink() or project.resolve().parent != (vault/'02 Projects').resolve():
        raise ValueError('Project path must stay inside 02 Projects.')
    if not (project/(name+'.md')).is_file():
        raise ValueError('Missing project homepage: '+name)
    repo = reserve(config, name, repo)
    owner = config['owner']
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9-]*', owner):
        raise ValueError('Invalid GitHub owner.')
    url = 'https://github.com/'+owner+'/'+repo+'.git'
    rel = '02 Projects/'+name
    tracked = git(vault, 'ls-files', '--stage', '--', rel).stdout
    registered = tracked.startswith('160000 ')
    if tracked and not registered:
        raise RuntimeError('Parent already tracks project contents; untrack them explicitly after backup.')
    if registered:
        restore_gitfile(vault, project, repo)
    save_config(vault, config)  # Pending mappings survive network/authentication failures.
    meta = run(['gh', 'repo', 'view', owner+'/'+repo, '--json', 'nameWithOwner,isPrivate,defaultBranchRef'], vault, check=False)
    if meta.returncode:
        if not ('Could not resolve to a Repository' in meta.stderr or 'HTTP 404' in meta.stderr):
            raise RuntimeError(meta.stderr.strip())
        run(['gh', 'repo', 'create', owner+'/'+repo, '--private', '--description', name+' research proposal and experiment notes'], vault)
        meta = run(['gh', 'repo', 'view', owner+'/'+repo, '--json', 'nameWithOwner,isPrivate,defaultBranchRef'], vault)
    data = json.loads(meta.stdout)
    if data['nameWithOwner'].casefold() != (owner+'/'+repo).casefold() or not data['isPrivate']:
        raise RuntimeError('Expected the configured private repository; refusing to publish notes elsewhere.')
    if (data.get('defaultBranchRef') or {}).get('name', 'main') not in ('', 'main'):
        raise RuntimeError('Existing repository uses a different default branch; review before adoption.')
    if (project/'.git').exists():
        if Path(git(project, 'rev-parse', '--show-toplevel').stdout.strip()).resolve() != project.resolve():
            raise RuntimeError('Project is not an independent Git checkout.')
        existing_url = git(project, 'config', '--get', 'remote.origin.url').stdout.strip()
        canonical = lambda u: u.removesuffix('.git').replace('git@github.com:', 'https://github.com/').casefold()
        if canonical(existing_url) != canonical(url):
            raise RuntimeError('Project remote does not match its configured repository.')
        if registered:
            print(json.dumps({'project': name, 'repository': data['nameWithOwner'], 'status': 'already-connected'}, ensure_ascii=False), flush=True)
            return
    else:
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        backup = vault/'.project-repo-backups'/stamp/name
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(project, backup, copy_function=copy_content)
        heads = git(vault, 'ls-remote', '--heads', url).stdout
        if heads:
            if not any(line.endswith('refs/heads/main') for line in heads.splitlines()):
                raise RuntimeError('Existing repository has no main branch.')
            with tempfile.TemporaryDirectory(prefix='proposal-import-') as td:
                clone = Path(td)/'repo'
                if seed:
                    seed = Path(seed).resolve()
                    if git(seed, 'rev-parse', 'HEAD').stdout.strip() != next(line.split()[0] for line in heads.splitlines() if line.endswith('refs/heads/main')):
                        raise RuntimeError('Seed checkout does not match GitHub main.')
                    if git(seed, 'status', '--porcelain').stdout.strip():
                        raise RuntimeError('Seed checkout has local changes.')
                    git(vault, 'clone', '--quiet', '--no-hardlinks', str(seed), str(clone))
                    git(clone, 'remote', 'set-url', 'origin', url)
                else:
                    git(vault, 'clone', '--quiet', '--branch', 'main', url, str(clone))
                import_existing(project, clone)
                shutil.move(str(clone/'.git'), str(project/'.git'))
        else:
            git(project, 'init', '-b', 'main')
            git(project, 'remote', 'add', 'origin', url)
        print(json.dumps({'project': name, 'backup': str(backup)}, ensure_ascii=False), flush=True)
    if git(project, 'branch', '--show-current').stdout.strip() != 'main':
        raise RuntimeError('Project must be on main; existing branch was preserved.')
    note_repository(project, name, url.removesuffix('.git'))
    ignore = project/'.gitignore'
    current = ignore.read_text() if ignore.exists() else ''
    additions = [p for p in ['.DS_Store', '__pycache__/', '*.pyc'] if p not in current.splitlines()]
    if additions:
        ignore.write_text(current+('\n' if current and not current.endswith('\n') else '')+'\n'.join(additions)+'\n')
    if not (project/'README.md').exists():
        (project/'README.md').write_text('# '+name+'\n\n研究笔记仓库。项目入口为 ['+name+'](<'+name+'.md>)。\n\n在 Obsidian Vault 中的路径为 `02 Projects/'+name+'`；共享模板、论文与 Dashboard 由外层 Vault 提供。\n')
    for folder in ('assets', 'Docs', 'Meetings', 'Research Questions', 'Ideas', 'Experiments'):
        directory = project/folder
        directory.mkdir(exist_ok=True)
        if not any(directory.iterdir()):
            (directory/'.gitkeep').touch()
    git(project, 'add', '--all', '--', '.')
    if git(project, 'diff', '--cached', '--quiet', check=False).returncode:
        git(project, 'commit', '-m', 'chore: connect project notes to Proposal repository')
    git(project, 'push', '--set-upstream', 'origin', 'main')
    register(vault, name, repo, url)
    git(vault, 'add', '--', CONFIG)
    if parent_commit:
        paths = ['.gitmodules', CONFIG, rel]
        if git(vault, 'diff', '--cached', '--quiet', '--', *paths, check=False).returncode:
            git(vault, 'commit', '--only', '-m', 'chore: connect '+repo+' project submodule', '--', *paths)
        git(vault, 'push', 'origin', git(vault, 'branch', '--show-current').stdout.strip())
    print(json.dumps({'project': name, 'repository': data['nameWithOwner'], 'status': 'connected'}, ensure_ascii=False), flush=True)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--vault', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('command', choices=['ensure', 'sync', 'status'])
    parser.add_argument('project', nargs='?')
    parser.add_argument('--repo', help='English name, with or without -Proposal')
    parser.add_argument('--seed', type=Path, help='Clean checkout matching GitHub main; only for initial migration')
    parser.add_argument('--no-parent-commit', action='store_true')
    args = parser.parse_args()
    vault = args.vault.resolve()
    if Path(git(vault, 'rev-parse', '--show-toplevel').stdout.strip()).resolve() != vault:
        raise ValueError('--vault must be the root Git repository.')
    if args.command == 'status':
        config = json.loads((vault/CONFIG).read_text())
        for name, repo in config['projects'].items():
            p = vault/'02 Projects'/name
            print(json.dumps({'project': name, 'repo': repo, 'connected': (p/'.git').exists()}, ensure_ascii=False))
        return
    lockpath = Path(git(vault, 'rev-parse', '--absolute-git-dir').stdout.strip())/'project-repositories.lock'
    with lockpath.open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        config = json.loads((vault/CONFIG).read_text())
        if (config['suffix'], config['visibility'], config['branch']) != ('-Proposal', 'private', 'main'):
            raise ValueError('Policy must be -Proposal, private, main.')
        names = [args.project] if args.command == 'ensure' else sorted(p.name for p in (vault/'02 Projects').iterdir() if p.is_dir() and not p.name.startswith(('.', '_')))
        for name in names:
            project_name(name)
            slug = args.repo or config['projects'].get(name)
            if not slug:
                note = (vault/'02 Projects'/name/(name+'.md')).read_text()
                match = re.search(r'^repository:\s*[\"\']?https://github\.com/'+re.escape(config['owner'])+r'/([A-Za-z0-9._-]+)', note, re.M)
                slug = match.group(1) if match else name
            provision(vault, config, name, slug, args.seed, not args.no_parent_commit)

if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, OSError, shutil.Error, subprocess.TimeoutExpired) as error:
        raise SystemExit(str(error))
