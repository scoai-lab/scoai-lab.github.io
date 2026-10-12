import unittest, sys, tempfile, json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from sync_data import normalize_mpc, timestamp
import sync_data

class NormalizeTest(unittest.TestCase):
    def test_aoe(self):
        self.assertEqual(timestamp('2026-10-12 23:59', None),'2026-10-12T23:59:00-12:00')
    def test_pacific_dst(self):
        self.assertTrue(timestamp('2026-07-12 23:59','PT').endswith('-07:00'))
        self.assertTrue(timestamp('2026-01-12 23:59','PT').endswith('-08:00'))
    def test_expected_never_confirmed_and_rounds_retained(self):
        r=normalize_mpc({'name':'Test','year':2027,'tags':['EXP','COREAS'],'deadline':['2026-10-12 23:59','2027-01-01 23:59']})
        self.assertTrue(r['tba'])
        self.assertEqual(len(r['deadlines']),2)
        self.assertIn('A*',r['tags'])
    def test_invalid_date_is_unknown(self):
        self.assertIsNone(timestamp('TBA',None))
    def test_source_namespaces(self):
        record={'name':'CHES','year':2027,'link':'https://example.org','deadline':[]}
        self.assertNotEqual(sync_data.common(record)['id'],normalize_mpc(record)['id'])
    def test_metadata_only_refresh_is_saved(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            for kind in ['mpc','conference']:
                folder=root/f'upstream-{kind}'/'_data'; folder.mkdir(parents=True)
                (folder/'conferences.yml').write_text('- name: Test\n  year: 2027\n  deadline: []\n  deadlines: []\n')
            (root/'upstream-mpc/_data/filters.yml').write_text('filter1: []\nfilter2: []\nfilter3: []\n')
            areas=root/'upstream-conference/_data/areas.yml'
            areas.write_text('- tag: AI\n  label: Old name\n')
            original=sync_data.ROOT
            try:
                sync_data.ROOT=root/'output'
                sync_data.ROOT.mkdir()
                sync_data.sync(root)
                areas.write_text('- tag: AI\n  label: New name\n')
                sync_data.sync(root)
                self.assertEqual(json.loads((sync_data.ROOT/'data/conference.json').read_text())['groups'][0]['options'][0]['name'],'New name')
            finally: sync_data.ROOT=original

if __name__=='__main__': unittest.main()
