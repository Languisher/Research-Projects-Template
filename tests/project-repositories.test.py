import importlib.util
import json
import subprocess
import os
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

spec = importlib.util.spec_from_file_location('manager', Path(__file__).parents[1] / 'tools/project_repositories.py')
manager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(manager)

def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], text=True).strip()

class ProjectRepositoriesTests(unittest.TestCase):
    def test_names_and_path_traversal(self):
        self.assertEqual(manager.repo_name('New Research'), 'New-Research-Proposal')
        self.assertEqual(manager.repo_name('Demo-Proposal'), 'Demo-Proposal')
        for name in ['中文', '../outside', '.hidden', '_Shared', '']:
            with self.assertRaises(ValueError):
                manager.repo_name(name)

    def test_case_insensitive_repo_collision(self):
        config = {'projects': {'First': 'Demo-Proposal'}}
        with self.assertRaises(ValueError):
            manager.reserve(config, 'Second', 'demo-Proposal')

    def test_import_preserves_local_changes_and_refuses_divergence(self):
        with tempfile.TemporaryDirectory() as td:
            remote, local = Path(td)/'remote', Path(td)/'local'
            remote.mkdir(); local.mkdir()
            git(remote, 'init', '-b', 'main')
            git(remote, 'config', 'user.name', 'Test')
            git(remote, 'config', 'user.email', 'test@example.com')
            (remote/'note.md').write_text('old\n')
            git(remote, 'add', '.'); git(remote, 'commit', '-m', 'initial')
            (local/'note.md').write_text('old\n')
            (local/'local-only.md').write_text('keep me\n')
            (remote/'note.md').write_text('new\n')
            (remote/'evidence.json').write_text('{}\n')
            git(remote, 'add', '.'); git(remote, 'commit', '-m', 'new results')
            manager.import_existing(local, remote)
            self.assertEqual((local/'note.md').read_text(), 'new\n')
            self.assertEqual((local/'local-only.md').read_text(), 'keep me\n')
            self.assertTrue((local/'evidence.json').exists())
            (local/'note.md').write_text('different local\n')
            (local/'evidence.json').write_text('different evidence\n')
            (remote/'remote-only.md').write_text('not imported on conflict\n')
            git(remote, 'add', '.'); git(remote, 'commit', '-m', 'third')
            with self.assertRaises(RuntimeError):
                manager.import_existing(local, remote)
            self.assertEqual((local/'note.md').read_text(), 'different local\n')
            self.assertFalse((local/'remote-only.md').exists())

    def test_submodule_registration_is_idempotent_and_restorable(self):
        with tempfile.TemporaryDirectory() as td:
            vault = Path(td)/'vault'; vault.mkdir()
            git(vault, 'init', '-b', 'main')
            git(vault, 'config', 'user.name', 'Test')
            git(vault, 'config', 'user.email', 'test@example.com')
            (vault/'README.md').write_text('vault\n')
            git(vault, 'add', '.'); git(vault, 'commit', '-m', 'initial')
            child = vault/'02 Projects'/'Demo'; child.mkdir(parents=True)
            git(child, 'init', '-b', 'main')
            git(child, 'config', 'user.name', 'Test')
            git(child, 'config', 'user.email', 'test@example.com')
            (child/'Demo.md').write_text('research\n')
            git(child, 'add', '.'); git(child, 'commit', '-m', 'research')
            bare = Path(td)/'Demo-Proposal.git'
            subprocess.check_call(['git', 'clone', '--quiet', '--bare', str(child), str(bare)])
            git(child, 'remote', 'add', 'origin', str(bare))
            manager.register(vault, 'Demo', 'Demo-Proposal', str(bare))
            git(vault, 'commit', '-m', 'register')
            manager.register(vault, 'Demo', 'Demo-Proposal', str(bare))
            self.assertEqual(git(vault, 'status', '--porcelain'), '')
            self.assertTrue((child/'.git').is_file())
            clone = Path(td)/'restored'
            subprocess.check_call(['git', '-c', 'protocol.file.allow=always', 'clone', '--quiet', '--recurse-submodules', str(vault), str(clone)])
            self.assertEqual((clone/'02 Projects/Demo/Demo.md').read_text(), 'research\n')
            (child/'.git').unlink()
            (child/'Demo.md').write_text('new unsaved research\n')
            manager.restore_gitfile(vault, child, 'Demo-Proposal')
            self.assertEqual(Path(git(child, 'rev-parse', '--show-toplevel')).resolve(), child.resolve())
            self.assertEqual((child/'Demo.md').read_text(), 'new unsaved research\n')

    def test_local_edit_is_preserved_when_upstream_did_not_change_that_file(self):
        with tempfile.TemporaryDirectory() as td:
            remote, local = Path(td)/'remote', Path(td)/'local'
            remote.mkdir(); local.mkdir()
            git(remote, 'init', '-b', 'main')
            git(remote, 'config', 'user.name', 'Test')
            git(remote, 'config', 'user.email', 'test@example.com')
            for name in ['results.md', 'question.md']:
                (remote/name).write_text('old\n'); (local/name).write_text('old\n')
            git(remote, 'add', '.'); git(remote, 'commit', '-m', 'shared version')
            (remote/'results.md').write_text('new upstream results\n')
            git(remote, 'add', '.'); git(remote, 'commit', '-m', 'updated results')
            (local/'question.md').write_text('new local question\n')
            manager.import_existing(local, remote)
            self.assertEqual((local/'results.md').read_text(), 'new upstream results\n')
            self.assertEqual((local/'question.md').read_text(), 'new local question\n')

    def test_provision_creates_private_repo_and_does_not_publish_later_edits(self):
        with tempfile.TemporaryDirectory() as td:
            vault, bare = Path(td)/'vault', Path(td)/'Demo.git'
            vault.mkdir(); bare.mkdir()
            git(vault, 'init', '-b', 'main'); git(bare, 'init', '--bare', '-b', 'main')
            git(vault, 'config', 'user.name', 'Test'); git(vault, 'config', 'user.email', 'test@example.com')
            (vault/'README.md').write_text('vault\n')
            git(vault, 'add', '.'); git(vault, 'commit', '-m', 'vault')
            parent_remote=Path(td)/'Vault.git'
            subprocess.check_call(['git','clone','--quiet','--bare',str(vault),str(parent_remote)])
            git(vault, 'remote', 'add', 'origin', str(parent_remote))
            (vault/'README.md').write_text('unrelated staged draft\n')
            git(vault, 'add', 'README.md')
            project = vault/'02 Projects/Demo'; project.mkdir(parents=True)
            (project/'Demo.md').write_text('---\ntype: project\n---\nResearch\n')
            global_config = Path(td)/'gitconfig'
            global_config.write_text('[url "'+str(bare)+'"]\n insteadOf = https://github.com/Test/Demo-Proposal.git\n')
            config = {'owner':'Test','projects':{}}
            real_run = manager.run; created = []
            def boundary(args, cwd, check=True):
                if args[0] != 'gh': return real_run(args, cwd, check)
                if args[1:3] == ['repo', 'create']:
                    self.assertIn('--private', args); created.append(args)
                    return subprocess.CompletedProcess(args, 0, '', '')
                if not created:
                    return subprocess.CompletedProcess(args, 1, '', 'Could not resolve to a Repository')
                return subprocess.CompletedProcess(args, 0, json.dumps({'nameWithOwner':'Test/Demo-Proposal','isPrivate':True,'defaultBranchRef':None}), '')
            env = {'GIT_CONFIG_GLOBAL':str(global_config),'GIT_AUTHOR_NAME':'Test','GIT_AUTHOR_EMAIL':'test@example.com','GIT_COMMITTER_NAME':'Test','GIT_COMMITTER_EMAIL':'test@example.com'}
            with patch.dict(os.environ, env), patch.object(manager, 'run', side_effect=boundary):
                manager.provision(vault, config, 'Demo', 'Demo-Proposal', parent_commit=True)
                self.assertEqual(len(created), 1)
                self.assertTrue((project/'.git').is_file())
                self.assertEqual(git(parent_remote, 'show', 'HEAD:README.md'), 'vault')
                self.assertEqual(git(vault, 'show', ':README.md'), 'unrelated staged draft')
                self.assertTrue(git(parent_remote, 'ls-tree', 'HEAD', '--', '02 Projects/Demo').startswith('160000 commit'))
                self.assertIn('repository: "https://github.com/Test/Demo-Proposal"', git(bare, 'show', 'HEAD:Demo.md'))
                previous = git(bare, 'rev-parse', 'HEAD')
                (project/'Demo.md').write_text('new research, not ready to publish\n')
                manager.provision(vault, config, 'Demo', 'Demo-Proposal', parent_commit=False)
                self.assertEqual(git(bare, 'rev-parse', 'HEAD'), previous)
                self.assertEqual(len(created), 1)

    def test_public_existing_repo_is_rejected_before_notes_are_committed(self):
        with tempfile.TemporaryDirectory() as td:
            vault=Path(td); git(vault, 'init', '-b', 'main')
            project=vault/'02 Projects/Demo'; project.mkdir(parents=True)
            (project/'Demo.md').write_text('---\ntype: project\n---\nprivate notes\n')
            real_run=manager.run
            def boundary(args, cwd, check=True):
                if args[0] != 'gh': return real_run(args, cwd, check)
                return subprocess.CompletedProcess(args, 0, json.dumps({'nameWithOwner':'Test/Demo-Proposal','isPrivate':False,'defaultBranchRef':None}), '')
            with patch.object(manager, 'run', side_effect=boundary):
                with self.assertRaisesRegex(RuntimeError, 'private repository'):
                    manager.provision(vault, {'owner':'Test','projects':{}}, 'Demo', 'Demo-Proposal', parent_commit=False)
            self.assertFalse((project/'.git').exists())
            self.assertIn('private notes', (project/'Demo.md').read_text())

if __name__ == '__main__':
    unittest.main()
