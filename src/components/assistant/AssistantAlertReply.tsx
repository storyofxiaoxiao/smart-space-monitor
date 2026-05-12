interface ParsedAlertTable {
  intro: string;
  rows: { device: string; alertType: string; detail: string; level: string; extra: string }[];
  suffix: string;
}

function parseAlertTableRow(rest: string): ParsedAlertTable['rows'][0] | null {
  const tailMatch = rest.match(/（([^）]+)）\s*$/);
  if (!tailMatch) return null;
  const main = rest.slice(0, tailMatch.index ?? 0).trim();
  const tail = tailMatch[1];
  const parts = main.split('：');
  let device: string;
  let alertType: string;
  let detail: string;
  if (parts.length >= 3) {
    device = parts[0];
    alertType = parts[1];
    detail = parts.slice(2).join('：');
  } else if (parts.length === 2) {
    device = parts[0];
    alertType = '—';
    detail = parts[1];
  } else {
    return null;
  }
  const segs = tail.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  const level = segs[0] || '—';
  const extra = segs.slice(1).join('，') || '—';
  return { device, alertType, detail, level, extra };
}

function tryParseAlertListTable(content: string): ParsedAlertTable | null {
  const trimmed = content.trim();
  const introMatch = trimmed.match(/^找到\s*\d+\s*条告警[：:]\s*/);
  if (!introMatch) return null;
  const intro = trimmed.slice(0, introMatch[0].length).trim();
  const afterIntroRaw = trimmed.slice(introMatch[0].length).trim();
  if (!afterIntroRaw) return null;

  let linesAll = afterIntroRaw.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  if (linesAll.length > 0 && !/^[-–]/.test(linesAll[0]) && afterIntroRaw.includes(' - ')) {
    const chunks = afterIntroRaw.split(/\s+-\s+/).map((c) => c.trim()).filter(Boolean);
    linesAll = chunks.map((c) => (c.startsWith('-') || c.startsWith('–') ? c : `- ${c}`));
  }

  const rows: ParsedAlertTable['rows'] = [];
  let i = 0;
  while (i < linesAll.length && /^[-–]/.test(linesAll[i])) {
    const rest = linesAll[i].replace(/^[-–]\s*/, '').trim();
    const parsed = parseAlertTableRow(rest);
    if (!parsed) break;
    rows.push(parsed);
    i++;
  }

  if (rows.length === 0) return null;
  const suffix = linesAll.slice(i).join('\n').trim();
  return { intro, rows, suffix };
}

function levelColor(level: string): string {
  const s = level.toLowerCase();
  if (s.includes('critical') || s.includes('严重')) return '#cf1322';
  if (s.includes('warning') || s.includes('告警')) return '#d46b08';
  if (s.includes('info')) return '#0958d9';
  return '#666';
}

export function AssistantMessageBody({ content }: { content: string }) {
  const parsed = tryParseAlertListTable(content);
  if (!parsed) {
    return (
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {content}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 10, fontWeight: 500 }}>{parsed.intro}</div>
      <div style={{ overflowX: 'auto', marginBottom: parsed.suffix ? 12 : 0 }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#fafafa', textAlign: 'left' }}>
              <th style={{ padding: '8px 6px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>设备</th>
              <th style={{ padding: '8px 6px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>告警类型</th>
              <th style={{ padding: '8px 6px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>描述</th>
              <th style={{ padding: '8px 6px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>级别</th>
              <th style={{ padding: '8px 6px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>备注</th>
            </tr>
          </thead>
          <tbody>
            {parsed.rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '8px 6px', verticalAlign: 'top', fontFamily: 'monospace', fontSize: 11 }}>
                  {row.device}
                </td>
                <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>{row.alertType}</td>
                <td style={{ padding: '8px 6px', verticalAlign: 'top', color: '#555' }}>{row.detail}</td>
                <td style={{ padding: '8px 6px', verticalAlign: 'top', color: levelColor(row.level), fontWeight: 500 }}>
                  {row.level}
                </td>
                <td style={{ padding: '8px 6px', verticalAlign: 'top', color: '#888', fontSize: 11 }}>{row.extra}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {parsed.suffix ? (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#333' }}>{parsed.suffix}</div>
      ) : null}
    </div>
  );
}
