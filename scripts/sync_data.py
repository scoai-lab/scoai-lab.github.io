"""Snapshot upstream YAML as browser-ready JSON; no upstream frontend code required."""
import argparse, datetime as dt, hashlib, json, re, urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo
import yaml

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {'mpc':'mpc-deadlines/mpc-deadlines.github.io','conference':'conference-deadlines/conference-deadlines.github.io'}
RANKS = {'COREAS':'A*','COREA':'A','COREB':'B','COREC':'C','COREN':'National','COREU':'Unranked','COREO':'Not classified','CORE-ASTAR':'A*','CORE-A':'A','CORE-B':'B','CORE-C':'C','CORE-N':'Unranked'}

def timestamp(value, zone):
    if not value: return None
    try:
        date=dt.datetime.fromisoformat(str(value))
    except ValueError: return None
    if date.tzinfo is None:
        zone={'PT':'America/Los_Angeles','EDT':'America/New_York','AoE':'Etc/GMT+12'}.get(zone,zone or 'Etc/GMT+12')
        date=date.replace(tzinfo=ZoneInfo(zone))
    return date.isoformat()

def common(record, source="conference"):
    result={k:v for k,v in record.items() if k not in ['deadline','timezone']}
    result['tags']=[RANKS.get(t,t) for t in record.get('tags',[])]
    result['id']=hashlib.sha256(f"{source}-{record['name']}-{record.get('year')}-{record.get('link')}".encode()).hexdigest()[:14]
    # Event dates remain display text; derive only an unambiguous first month/day.
    text=str(record.get('date',''))
    match=re.match(r'^([A-Za-z]+)\s+(\d{1,2})\b',text)
    if match:
        try: result['eventStart']=dt.datetime.strptime(f"{match[1]} {match[2]} {record.get('year')}",'%B %d %Y').date().isoformat()
        except ValueError: pass
    return result

def normalize_mpc(record):
    result=common(record, "mpc")
    result['tba']=bool(set(record.get('tags',[])) & {'EXP','EXPCFP'})
    result['deadlines']=[{'date':timestamp(d,record.get('timezone'))} for d in record.get('deadline',[])]
    result['sourceTimezone']=record.get('timezone') or 'AoE (UTC−12)'
    return result

def read_source(kind,path,offline):
    if offline: return (Path(offline)/f'upstream-{kind}'/path).read_text()
    url=f'https://raw.githubusercontent.com/{SOURCES[kind]}/main/{path}'
    with urllib.request.urlopen(url,timeout=45) as response: return response.read().decode()

def sync(offline=None):
    staged={}
    for kind in SOURCES:
        raw=read_source(kind,'_data/conferences.yml',offline)
        data=yaml.safe_load(raw)
        if not isinstance(data,list) or not data: raise ValueError(f'Empty or invalid {kind} data')
        records=[normalize_mpc(r) if kind=='mpc' else common(r) for r in data]
        if kind=='conference':
            areas=yaml.safe_load(read_source(kind,'_data/areas.yml',offline))
            for r in records: r['tags']+=r.get('areas',[])
            groups=[{'key':'area','label':'Research area','options':[{'tag':a['tag'],'name':a['label']} for a in areas]},
                    {'key':'rank','label':'CORE ranking','options':[{'tag':r,'name':r} for r in ['A*','A','B','C','Unranked']]}]
        else:
            filters=yaml.safe_load(read_source(kind,'_data/filters.yml',offline))
            groups=[{'key':key,'label':label,'options':[{'tag':RANKS.get(o['tag'],o['tag']),'name':o['name']} for o in filters[key]]} for key,label in [('filter1','Research domain'),('filter2','Publication type'),('filter3','CORE ranking')]]
        staged[kind]={'source':f'https://github.com/{SOURCES[kind]}','sourceHash':hashlib.sha256(raw.encode()).hexdigest(),'syncedAt':dt.datetime.now(dt.timezone.utc).isoformat(),'groups':groups,'entries':records}
    (ROOT/'data').mkdir(exist_ok=True)
    for kind,data in staged.items():
        target=ROOT/'data'/f'{kind}.json'
        # Keep update timestamps stable when source content is unchanged.
        if target.exists():
            previous=json.loads(target.read_text())
            if all(previous.get(key)==value for key,value in data.items() if key!='syncedAt'): continue
        temp=target.with_suffix('.tmp')
        temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
        temp.replace(target)
        print(f'{kind}: {len(data["entries"])} conferences')

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--offline',help='Parent directory containing upstream-mpc and upstream-conference')
    sync(parser.parse_args().offline)
