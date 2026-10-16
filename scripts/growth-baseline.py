"""Read Search Console performance without changing properties or saved tokens.

Usage: python3 scripts/growth-baseline.py
Requires the existing web-analytics OAuth token and Google API Python libraries.
"""

import json
import socket
from datetime import date, timedelta
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

ROOT = Path(__file__).resolve().parents[1]


def main():
    socket.setdefaulttimeout(25)
    creds = Credentials.from_authorized_user_file(
        ROOT / '.skills/web-analytics/scripts/token.json'
    )
    if not creds.valid:
        creds.refresh(Request())
    service = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)
    sites = service.sites().list().execute().get('siteEntry', [])
    matches = [s['siteUrl'] for s in sites if s['siteUrl'] in (
        'sc-domain:image-layered.app', 'https://image-layered.app/'
    )]
    if not matches:
        raise RuntimeError('No accessible Search Console property for image-layered.app')
    site = sorted(matches, key=lambda s: not s.startswith('sc-domain:'))[0]
    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=27)

    def query(first, last, dimensions):
        return service.searchanalytics().query(siteUrl=site, body={
            'startDate': first.isoformat(), 'endDate': last.isoformat(),
            'dimensions': dimensions, 'rowLimit': 100, 'dataState': 'final',
        }).execute().get('rows', [])

    result = {'site': site, 'collected': date.today().isoformat(), 'periods': {}}
    for name, first, last in [
        ('current', start, end),
        ('previous', start - timedelta(days=28), start - timedelta(days=1)),
    ]:
        result['periods'][name] = {
            'start': first.isoformat(), 'end': last.isoformat(),
            'totals': query(first, last, []),
        }
    for dimension in ['query', 'page', 'device', 'date']:
        result[dimension] = query(start, end, [dimension])
    output = ROOT / 'output/growth' / f'gsc-baseline-{date.today().isoformat()}.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2))
    print(json.dumps({'site': site, 'periods': result['periods'],
                      'top_queries': result['query'][:10],
                      'top_pages': result['page'][:10], 'output': str(output)},
                     ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Never print HTTP request details or OAuth credentials.
        print(f'Baseline unavailable ({type(error).__name__}). Check network access and OAuth authorization.')
        raise SystemExit(1)
