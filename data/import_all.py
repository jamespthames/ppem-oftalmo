#!/usr/bin/env python3
"""Combine all extracted exam JSON files and import via admin API."""
import json, sys, urllib.request, glob, re

VALID_TOPICS = {
    'Catarata','Córnea','Glaucoma','Oculoplástica',
    'Pediatría y Estrabismo','Retina','Uveítis',
    'Óptica y Optometría','Neuro Oftalmología'
}
VALID_TIPOS = {'opcion_multiple','falso_verdadero','completar','asociacion'}

def clean(q):
    """Normalize a question into the import schema. Return None to drop."""
    if not isinstance(q, dict): return None
    if not q.get('enunciado') or not q.get('opciones'): return None
    tipo = q.get('tipo','opcion_multiple')
    if tipo not in VALID_TIPOS: tipo = 'opcion_multiple'
    tema = q.get('tema','Córnea')
    if tema not in VALID_TOPICS: tema = 'Córnea'
    rc = (q.get('respuesta_correcta') or 'a').strip().lower()
    # take first single letter found
    m = re.search(r'[a-f]', rc)
    rc = m.group(0) if m else 'a'
    # normalize opciones keys to lowercase
    op = {}
    for k,v in (q.get('opciones') or {}).items():
        if v: op[str(k).strip().lower()] = str(v)
    if not op: return None
    return {
        'examen': q.get('examen','Sin nombre'),
        'tema': tema,
        'numero': q.get('numero',0),
        'tipo': tipo,
        'enunciado': q.get('enunciado',''),
        'opciones': op,
        'respuesta_correcta': rc,
        'tiene_imagen': bool(q.get('tiene_imagen')),
        'imagen_ref': q.get('imagen_ref','') or '',
        'nota': q.get('nota','') or '',
    }

def main():
    all_q = []
    for f in sorted(glob.glob('/tmp/exam_*.json')):
        try:
            data = json.load(open(f))
            for q in data:
                c = clean(q)
                if c: all_q.append(c)
            print(f'{f}: {len(data)} raw')
        except Exception as e:
            print(f'ERROR {f}: {e}')
    print(f'Total cleaned: {len(all_q)}')

    # Login
    req = urllib.request.Request(
        'http://localhost:3001/api/auth/login',
        data=json.dumps({'email':'admin@ppem.ucr.ac.cr','password':'admin123'}).encode(),
        headers={'Content-Type':'application/json'},
    )
    token = json.loads(urllib.request.urlopen(req).read())['token']

    # Import in chunks of 100
    imported = 0
    for i in range(0, len(all_q), 100):
        chunk = all_q[i:i+100]
        req = urllib.request.Request(
            'http://localhost:3001/api/admin/import',
            data=json.dumps({'questions': chunk}).encode(),
            headers={'Content-Type':'application/json','Authorization':f'Bearer {token}'},
        )
        r = json.loads(urllib.request.urlopen(req).read())
        imported += r.get('imported', 0)
        print(f'Chunk {i//100+1}: imported {r.get("imported")}')
    print(f'TOTAL IMPORTED: {imported}')

if __name__ == '__main__': main()
