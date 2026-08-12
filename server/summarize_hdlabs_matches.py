import json
import os
from pathlib import Path

report_path = Path(os.environ.get('HDLABS_MATCH_REPORT', '/home/ubuntu/gorilla-gear-nutrition/hdlabs-injectable-matches.log'))
report = json.loads(report_path.read_text())
summary = []
for record in report['matches']:
    source = record['source']
    matches = record['matches']
    summary.append({
        'source_name': source['name'],
        'source_image_url': source['imageUrl'],
        'match_count': len(matches),
        'matches': [
            {'id': item['id'], 'name': item['name'], 'slug': item['slug'], 'category': item['category'], 'has_primary_image': bool(item['imageCount'])}
            for item in matches
        ],
    })
Path('/home/ubuntu/gorilla-gear-nutrition/hdlabs-injectable-match-summary.json').write_text(json.dumps(summary, indent=2))
print(json.dumps({'source_count': len(summary), 'exact_one_count': sum(item['match_count'] == 1 for item in summary), 'unmatched_count': sum(item['match_count'] == 0 for item in summary), 'ambiguous_count': sum(item['match_count'] > 1 for item in summary)}, indent=2))
print(json.dumps(summary, indent=2))
