const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/clixx/OneDrive/Desktop/Clixxo_PBX_GUI/src/modules/System/System Settings';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let modifiedCount = 0;

for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;

  // Update C object colors
  content = content.replace(/cardBorder:\s*['"].*?['"]/, 'cardBorder: "#9CA3AF"');
  content = content.replace(/labelText:\s*['"].*?['"]/, 'labelText: "#3E5475"');
  content = content.replace(/valueText:\s*['"].*?['"]/, 'valueText: "#0f172a"');
  content = content.replace(/accent:\s*['"].*?['"]/, 'accent: "#3E5475"');
  
  // Update C dividers to cardBorder
  content = content.replace(/borderBottom:\s*`1px solid \$\{C\.divider\}`/g, 'borderBottom: `1px solid ${C.cardBorder}`');
  content = content.replace(/borderTop:\s*`1px solid \$\{C\.divider\}`/g, 'borderTop: `1px solid ${C.cardBorder}`');
  content = content.replace(/borderRight:\s*`1px solid \$\{C\.divider\}`/g, 'borderRight: `1px solid ${C.cardBorder}`');
  content = content.replace(/borderRight:\s*['"]1px solid #f1f5f9['"]/g, 'borderRight: `1px solid ${C.cardBorder}`');

  // Update strongText to valueText in the page header mapping
  content = content.replace(/color:\s*C\.strongText/g, 'color: C.valueText');

  // Replace TH component styles with PcmPstnPage style if present
  if (content.includes('const TH = ({')) {
    // A bit more precise regex for TH background to lineHeight block
    content = content.replace(
      /style=\{\{[\s\S]*?\}\}/,
      `style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "10px 8px",
      textAlign: "center",
      verticalAlign: "middle",
      borderBottom: \`1px solid \${C.cardBorder}\`,
      borderRight: \`1px solid \${C.cardBorder}\`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      lineHeight: 1.3,
      ...extra,
    }}`
    );
  }

  // Update Top Setting border radius from 20 to CARD_RADIUS but let's just make it hardcoded 20 for simplicity
  // We look for the main card container which has "background: C.cardBg, borderRadius: 20,"
  content = content.replace(/background:\s*C\.cardBg,\s*borderRadius:\s*20,/g, 'background: "#ffffff",\n            borderRadius: 10,');

  // Replace table header top corners 
  // PcmPstnPage uses borderTopLeftRadius: CARD_RADIUS (which is 20)
  // Our files might not have border radius on the header.
  
  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    modifiedCount++;
    console.log('Modified:', file);
  }
}
console.log('Total files modified:', modifiedCount);
