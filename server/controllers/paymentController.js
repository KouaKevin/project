import Payment from '../models/Payment.js';
import Child from '../models/Child.js';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

export const getPayments = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      status, 
      child,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (child) query.child = child;

    const payments = await Payment.find(query)
      .populate('child', 'firstName lastName class')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      recordedBy: req.user.id
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('child', 'firstName lastName class parent')
      .populate('recordedBy', 'name');

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const generateReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('child', 'firstName lastName class parent')
      .populate('recordedBy', 'name');

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    const receiptTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reçu de Paiement</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .receipt-info { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Garderie Management</h1>
            <h2>Reçu de Paiement</h2>
        </div>
        
        <div class="receipt-info">
            <p><strong>Numéro de reçu:</strong> {{receiptNumber}}</p>
            <p><strong>Date:</strong> {{paymentDate}}</p>
            <p><strong>Enfant:</strong> {{child.firstName}} {{child.lastName}}</p>
            <p><strong>Classe:</strong> {{child.class}}</p>
            <p><strong>Parent:</strong> {{child.parent.name}}</p>
        </div>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Méthode</th>
                    <th>Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Frais de garderie - {{type}}</td>
                    <td>{{type}}</td>
                    <td>{{paymentMethod}}</td>
                    <td>{{amount}} FCFA</td>
                </tr>
            </tbody>
        </table>
        
        <div class="footer">
            <p>Merci pour votre confiance</p>
            <p><em>Reçu généré par: {{recordedBy.name}}</em></p>
        </div>
    </body>
    </html>
    `;

    const template = handlebars.compile(receiptTemplate);
    const html = template({
      ...payment.toObject(),
      paymentDate: payment.paymentDate.toLocaleDateString('fr-FR')
    });

    // ⚠️ Puppeteer configuré pour Render
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html);
    let pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    if (!Buffer.isBuffer(pdf)) {
      pdf = Buffer.from(pdf);
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=recu-${payment.receiptNumber}.pdf`
    });

    res.send(pdf);
  } catch (error) {
    console.error('Erreur PDF:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du reçu' });
  }
};


export const getDailyReport = async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const payments = await Payment.find({
      paymentDate: { $gte: startDate, $lt: endDate }
    }).populate('child', 'firstName lastName class');

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const summary = {
      date,
      totalPayments: payments.length,
      totalAmount,
      paymentsByMethod: {},
      paymentsByType: {}
    };

    payments.forEach(payment => {
      summary.paymentsByMethod[payment.paymentMethod] = 
        (summary.paymentsByMethod[payment.paymentMethod] || 0) + payment.amount;
      
      summary.paymentsByType[payment.type] = 
        (summary.paymentsByType[payment.type] || 0) + payment.amount;
    });

    res.json({ payments, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
