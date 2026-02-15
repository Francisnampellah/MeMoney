import { Transaction } from '../services/sms/types';
import RNPrint from 'react-native-print';


export const getReceiptHtml = (transaction: Transaction): string => {
    return `
        <html>
            <head>
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        background-color: #f5f5f5;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                    }
                    .receipt {
                        background-color: #fff;
                        width: 100%;
                        max-width: 400px;
                        padding: 20px;
                        border: 1px dashed #ccc;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .brand {
                        font-size: 24px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin-bottom: 5px;
                    }
                    .date {
                        font-size: 12px;
                        color: #666;
                    }
                    .divider {
                        border-top: 2px dashed #ccc;
                        margin: 20px 0;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    .label {
                        font-size: 14px;
                        color: #666;
                    }
                    .value {
                        font-size: 14px;
                        color: #000;
                        font-weight: bold;
                        text-align: right;
                    }
                    .total-row {
                        border-top: 2px solid #000;
                        padding-top: 10px;
                        margin-top: 10px;
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #ccc;
                        margin-top: 20px;
                        font-style: italic;
                    }
                    .token-box {
                        border: 1px dashed #000;
                        padding: 10px;
                        text-align: center;
                        margin-bottom: 20px;
                        background-color: #fafafa;
                    }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <div class="brand">MeMoney</div>
                        <div class="date">${transaction.date} • ${transaction.time}</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    ${transaction.transaction_id ? `
                    <div class="token-box">
                        <div class="label" style="font-size: 10px; text-transform: uppercase; margin-bottom: 5px;">TRANSACTION ID</div>
                        <div class="value" style="font-size: 16px; text-align: center;">${transaction.transaction_id}</div>
                    </div>` : ''}

                    <div class="divider"></div>

                    <div class="row">
                        <div class="label">Type</div>
                        <div class="value">${transaction.type.replace(/_/g, ' ')}</div>
                    </div>
                    <div class="row">
                        <div class="label">Status</div>
                        <div class="value">${transaction.status}</div>
                    </div>
                    <div class="row">
                        <div class="label">Counterparty</div>
                        <div class="value">${transaction.counterparty_name || 'Unknown'}</div>
                    </div>
                    <div class="row">
                        <div class="label">Account</div>
                        <div class="value">${transaction.counterparty_account || 'N/A'}</div>
                    </div>

                    <div class="divider"></div>

                    <div class="row">
                        <div class="label">Amount</div>
                        <div class="value">${transaction.currency} ${transaction.amount.toLocaleString()}</div>
                    </div>
                    <div class="row">
                        <div class="label">Fee</div>
                        <div class="value">${transaction.currency} ${transaction.fee.toLocaleString()}</div>
                    </div>
                    ${transaction.government_levy > 0 ? `
                    <div class="row">
                        <div class="label">Levy</div>
                        <div class="value">${transaction.currency} ${transaction.government_levy.toLocaleString()}</div>
                    </div>` : ''}

                    <div class="row total-row">
                        <div>TOTAL</div>
                        <div>${transaction.currency} ${(transaction.amount + transaction.fee + transaction.government_levy).toLocaleString()}</div>
                    </div>

                    <div class="footer">
                        Thank you for using MeMoney<br/>
                        ${transaction.balance_after ? `Balance: ${transaction.currency} ${transaction.balance_after.toLocaleString()}` : ''}
                    </div>
                </div>
            </body>
        </html>
    `;
};

export const generateReceiptHtml = async (transaction: Transaction): Promise<string> => {
    // Generate HTML string with inline styles to mimic receipt
    const html = getReceiptHtml(transaction);

    try {
        // @ts-ignore
        const results = await RNPrint.printToFile({
            html: html,
            fileName: `Receipt_${transaction.transaction_id || Date.now()}`,
            base64: false
        });
        return results.filePath || ''; // Returns file path
    } catch (err: any) {
        console.error("PDF Generation Error:", err);
        throw err;
    }
}
