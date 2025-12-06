import React, { useState } from 'react';

export default function GroundedSoapPanel({ defaultMeta = { patientId: 'demo-1', species: 'dog', weightKg: 8 } }) {
  const [transcript, setTranscript] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const callGrounded = async () => {
    if (!transcript.trim()) {
      alert('Please paste or type the transcript first.');
      return;
    }
    setLoading(true);
    setOutput('⏳ Generating grounded SOAP...');
    try {
      const res = await fetch('/api/grounded-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, meta: defaultMeta })
      });
      const data = await res.json();
      if (!res.ok) {
        setOutput('❌ Error: ' + JSON.stringify(data, null, 2));
        setLoading(false);
        return;
      }
      if (data.status === 'review_required') {
        setOutput('⚠️ REVIEW REQUIRED\n\n' + JSON.stringify(data, null, 2));
      } else if (data.status === 'med_review_required') {
        setOutput('⚠️ MEDICATION REVIEW REQUIRED\n\n' + JSON.stringify(data, null, 2));
      } else {
        setOutput('✅ GROUNDED SOAP OK\n\n' + JSON.stringify(data, null, 2));
      }
    } catch (e) {
      setOutput('❌ Network or parsing error: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px dashed #ddd', padding: 12, borderRadius: 6, marginTop: 12 }}>
      <label htmlFor="transcriptInput"><strong>Transcript</strong></label>
      <textarea
        id="transcriptInput"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={6}
        style={{ width: '100%', boxSizing: 'border-box', marginTop: 6 }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={callGrounded} disabled={loading}>{loading ? 'Generating...' : 'Generate Grounded SOAP'}</button>
        <button onClick={() => { setTranscript(''); setOutput(''); }} style={{ marginLeft: 8 }}>Clear</button>
      </div>
      <pre id="groundedOutput" style={{ background: '#111', color: '#fff', padding: 12, borderRadius: 6, marginTop: 12, maxHeight: 320, overflow: 'auto' }}>
        {output}
      </pre>
    </div>
  );
}

