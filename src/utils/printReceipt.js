const printReceipt = ({ donation, funeral, orgName, contactPhone }) => {
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - ${donation.receipt_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 80mm;
          font-family: monospace;
          font-size: 11px;
          background: white;
        }
        body {
          padding: 4mm;
          display: inline-block;
          width: 80mm;
        }
        .center { text-align: center; }
        .bold { font-weight: 700; }
        .divider { text-align: center; color: #999; margin: 5px 0; font-size: 10px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .amount { font-size: 16px; font-weight: 800; text-align: center; margin: 6px 0; color: #1a3c5e; }
        .small { font-size: 10px; color: #555; margin-bottom: 2px; }
        .contact { font-size: 10px; color: #888; margin-top: 3px; }
        .org { font-size: 13px; font-weight: 800; color: #1a3c5e; letter-spacing: 1px; }
        .subtitle { font-size: 9px; color: #666; margin: 2px 0 4px; }
        .photo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #1a3c5e; margin-bottom: 4px; }
        @page {
          size: 80mm auto;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="center">
        ${funeral?.photo ? `<img src="${funeral.photo}" class="photo" onerror="this.style.display='none'" />` : ''}
        <div class="org">${orgName || 'FDMS'}</div>
        <div class="subtitle">FUNERAL DONATION RECEIPT</div>
        <div class="divider">================================</div>
      </div>

      ${funeral ? `
      <div class="row"><span class="bold">Deceased:</span><span>${funeral.deceased_name || ''}</span></div>
      <div class="row"><span class="bold">Date:</span><span>${funeral.funeral_date ? new Date(funeral.funeral_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span></div>
      <div class="row"><span class="bold">Venue:</span><span>${funeral.venue || ''}</span></div>
      <div class="divider">--------------------------------</div>
      ` : ''}

      <div class="row"><span class="bold">Receipt No:</span><span>${donation.receipt_number}</span></div>
      <div class="row"><span class="bold">Date:</span><span>${new Date(donation.created_at).toLocaleDateString()}</span></div>
      <div class="row"><span class="bold">Time:</span><span>${new Date(donation.created_at).toLocaleTimeString()}</span></div>
      <div class="divider">--------------------------------</div>

      <div class="row"><span class="bold">Donor:</span><span>${donation.donor_name}</span></div>
      <div class="row"><span class="bold">Phone:</span><span>${donation.phone_number}</span></div>
      <div class="amount">GHS ${parseFloat(donation.amount).toFixed(2)}</div>
      <div class="row"><span class="bold">For:</span><span>${Array.isArray(donation.recipient_names) ? donation.recipient_names.join(', ') : (donation.recipient_names || '')}</span></div>
      <div class="row"><span class="bold">Method:</span><span>${donation.payment_method}</span></div>
      <div class="divider">--------------------------------</div>

      <div class="center">
        <div class="small">Thank you for your kind donation.</div>
        <div class="small">God bless you.</div>
        ${contactPhone ? `<div class="contact">For inquiries: ${contactPhone}</div>` : ''}
        <div class="divider">================================</div>
      </div>

      <script>
        window.onload = function() {
          var height = document.body.scrollHeight;
          window.resizeTo(340, height + 50);
          window.print();
          setTimeout(function() { window.close(); }, 1000);
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=340,height=400,scrollbars=no');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
};

export default printReceipt;