// SMTP email service for P&D I&C rental system
import nodemailer from 'nodemailer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Email configuration from environment variables
const EMAIL_CONFIG = {
  enabled: process.env.EMAIL_ENABLED === 'true',
  host: process.env.SMTP_HOST || 'outbound.daouoffice.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'noreply@pndinc.co.kr',
    pass: process.env.SMTP_PASSWORD || ''
  },
  from: process.env.EMAIL_FROM || 'noreply@pndinc.co.kr'
};

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailLog {
  timestamp: string;
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  sent: boolean;
  error?: string;
}

// Create logs directory if it doesn't exist
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Log email to file
function logEmail(emailData: EmailLog) {
  const logFile = join(logsDir, `emails_${new Date().toISOString().split('T')[0]}.json`);
  const logEntry = JSON.stringify(emailData, null, 2) + '\n';
  
  try {
    writeFileSync(logFile, logEntry, { flag: 'a' });
    console.log(`Email logged to: ${logFile}`);
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

// Create SMTP transporter
function createTransporter() {
  if (!EMAIL_CONFIG.enabled) {
    return null;
  }

  return nodemailer.createTransporter({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: EMAIL_CONFIG.auth,
    tls: {
      rejectUnauthorized: false // For development/testing
    }
  });
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const emailData: EmailLog = {
    timestamp: new Date().toISOString(),
    to: params.to,
    from: params.from || EMAIL_CONFIG.from,
    subject: params.subject,
    text: params.text,
    html: params.html,
    sent: false
  };

  try {
    // Always log the email for record keeping
    if (EMAIL_CONFIG.enabled) {
      const transporter = createTransporter();
      
      if (!transporter) {
        throw new Error('Failed to create email transporter');
      }

      if (!EMAIL_CONFIG.auth.pass) {
        throw new Error('SMTP password not configured');
      }

      const mailOptions = {
        from: params.from || EMAIL_CONFIG.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html
      };

      await transporter.sendMail(mailOptions);
      emailData.sent = true;
      console.log(`Email sent successfully to ${params.to}`);
    } else {
      console.log(`[DRY RUN] Email would be sent to ${params.to}: ${params.subject}`);
      console.log('Email sending is disabled. Set EMAIL_ENABLED=true to enable.');
    }

    logEmail(emailData);
    return true;
  } catch (error) {
    emailData.error = error instanceof Error ? error.message : 'Unknown error';
    logEmail(emailData);
    console.error('Email send error:', error);
    return false;
  }
}

// Get email logs for admin preview
export function getEmailLogs(date?: string): EmailLog[] {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logFile = join(logsDir, `emails_${targetDate}.json`);
    
    if (!existsSync(logFile)) {
      return [];
    }

    const fileContent = require('fs').readFileSync(logFile, 'utf8');
    const logs = fileContent.split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
    
    return logs;
  } catch (error) {
    console.error('Failed to read email logs:', error);
    return [];
  }
}

// Email templates for rental system
export const emailTemplates = {
  rentalRequest: (userName: string, itemName: string, expectedReturnDate: Date) => ({
    subject: `[P&D I&C] 대여 신청 승인 요청 - ${itemName}`,
    text: `${userName}님이 ${itemName} 대여를 신청했습니다.

▶ 물품명: ${itemName}
▶ 반납예정일: ${expectedReturnDate.toLocaleDateString('ko-KR')}
▶ 신청자: ${userName}

승인처리를 위해 IT 장비 관리 시스템에 로그인해주세요.

--
P&D I&C IT 장비 관리 시스템
자동발송 메일입니다.`,
    html: `
      <div style="font-family: 맑은고딕, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2c3e50; margin-top: 0;">🔔 대여 신청 승인 요청</h2>
          <p style="font-size: 16px; margin-bottom: 20px;"><strong>${userName}</strong>님이 새로운 대여 신청을 했습니다.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">물품명:</td>
                <td style="padding: 8px 0;">${itemName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">반납예정일:</td>
                <td style="padding: 8px 0;">${expectedReturnDate.toLocaleDateString('ko-KR')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">신청자:</td>
                <td style="padding: 8px 0;">${userName}</td>
              </tr>
            </table>
          </div>
          
          <p style="margin: 20px 0;">승인처리를 위해 <strong>IT 장비 관리 시스템</strong>에 로그인해주세요.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            P&D I&C IT 장비 관리 시스템<br>
            자동발송 메일입니다.
          </p>
        </div>
      </div>
    `
  }),

  rentalApproved: (userName: string, itemName: string, expectedReturnDate: Date) => ({
    subject: `[P&D I&C] 대여 승인 완료 - ${itemName}`,
    text: `${userName}님의 ${itemName} 대여 신청이 승인되었습니다.

▶ 물품명: ${itemName}
▶ 반납예정일: ${expectedReturnDate.toLocaleDateString('ko-KR')}

물품 수령 후 안전하게 사용해주시고, 반납예정일을 꼭 지켜주세요.

--
P&D I&C IT 장비 관리 시스템
자동발송 메일입니다.`,
    html: `
      <div style="font-family: 맑은고딕, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #27ae60; margin-top: 0;">✅ 대여 승인 완료</h2>
          <p style="font-size: 16px; margin-bottom: 20px;"><strong>${userName}</strong>님, 대여 신청이 승인되었습니다.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">물품명:</td>
                <td style="padding: 8px 0;">${itemName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">반납예정일:</td>
                <td style="padding: 8px 0; color: #e74c3c;"><strong>${expectedReturnDate.toLocaleDateString('ko-KR')}</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>📋 안내사항</strong><br>
              • 물품 수령 후 안전하게 사용해주세요<br>
              • 반납예정일을 꼭 지켜주세요<br>
              • 문제 발생 시 즉시 관리자에게 연락해주세요
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            P&D I&C IT 장비 관리 시스템<br>
            자동발송 메일입니다.
          </p>
        </div>
      </div>
    `
  }),

  rentalRejected: (userName: string, itemName: string, reason?: string) => ({
    subject: `[P&D I&C] 대여 신청 반려 - ${itemName}`,
    text: `${userName}님의 ${itemName} 대여 신청이 반려되었습니다.

▶ 물품명: ${itemName}
${reason ? `▶ 반려사유: ${reason}` : ''}

문의사항이 있으시면 관리자에게 연락해주세요.

--
P&D I&C IT 장비 관리 시스템
자동발송 메일입니다.`,
    html: `
      <div style="font-family: 맑은고딕, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #e74c3c; margin-top: 0;">❌ 대여 신청 반려</h2>
          <p style="font-size: 16px; margin-bottom: 20px;"><strong>${userName}</strong>님, 대여 신청이 반려되었습니다.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">물품명:</td>
                <td style="padding: 8px 0;">${itemName}</td>
              </tr>
              ${reason ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">반려사유:</td>
                <td style="padding: 8px 0; color: #e74c3c;">${reason}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            문의사항이 있으시면 관리자에게 연락해주세요.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            P&D I&C IT 장비 관리 시스템<br>
            자동발송 메일입니다.
          </p>
        </div>
      </div>
    `
  }),

  returnReminder: (userName: string, itemName: string, expectedReturnDate: Date, daysLeft: number) => ({
    subject: `[P&D I&C] 반납 예정 알림 - ${itemName} (${daysLeft}일 남음)`,
    text: `${userName}님, ${itemName}의 반납예정일이 ${daysLeft}일 남았습니다.

▶ 물품명: ${itemName}
▶ 반납예정일: ${expectedReturnDate.toLocaleDateString('ko-KR')}
▶ 남은 기간: ${daysLeft}일

반납예정일에 맞춰 물품을 반납해주세요.

--
P&D I&C IT 장비 관리 시스템
자동발송 메일입니다.`,
    html: `
      <div style="font-family: 맑은고딕, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #f39c12; margin-top: 0;">⏰ 반납 예정 알림</h2>
          <p style="font-size: 16px; margin-bottom: 20px;"><strong>${userName}</strong>님, 대여물품의 반납예정일이 다가오고 있습니다.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">물품명:</td>
                <td style="padding: 8px 0;">${itemName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">반납예정일:</td>
                <td style="padding: 8px 0; color: #e74c3c;"><strong>${expectedReturnDate.toLocaleDateString('ko-KR')}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">남은 기간:</td>
                <td style="padding: 8px 0; color: ${daysLeft <= 1 ? '#e74c3c' : '#f39c12'};"><strong>${daysLeft}일</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>📋 반납 안내</strong><br>
              반납예정일에 맞춰 물품을 반납해주세요.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            P&D I&C IT 장비 관리 시스템<br>
            자동발송 메일입니다.
          </p>
        </div>
      </div>
    `
  }),

  overdue: (userName: string, itemName: string, expectedReturnDate: Date, daysOverdue: number) => ({
    subject: `[P&D I&C] 반납 연체 알림 - ${itemName} (${daysOverdue}일 연체)`,
    text: `${userName}님, ${itemName}의 반납이 ${daysOverdue}일 연체되었습니다.

▶ 물품명: ${itemName}
▶ 반납예정일: ${expectedReturnDate.toLocaleDateString('ko-KR')}
▶ 연체기간: ${daysOverdue}일

즉시 물품을 반납해주시기 바랍니다.

--
P&D I&C IT 장비 관리 시스템
자동발송 메일입니다.`,
    html: `
      <div style="font-family: 맑은고딕, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #e74c3c; margin-top: 0;">🚨 반납 연체 알림</h2>
          <p style="font-size: 16px; margin-bottom: 20px;"><strong>${userName}</strong>님, 대여물품 반납이 연체되었습니다.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">물품명:</td>
                <td style="padding: 8px 0;">${itemName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">반납예정일:</td>
                <td style="padding: 8px 0; color: #e74c3c;"><strong>${expectedReturnDate.toLocaleDateString('ko-KR')}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">연체기간:</td>
                <td style="padding: 8px 0; color: #e74c3c;"><strong>${daysOverdue}일</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">
            <p style="margin: 0; color: #721c24;">
              <strong>⚠️ 긴급</strong><br>
              즉시 물품을 반납해주시기 바랍니다.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            P&D I&C IT 장비 관리 시스템<br>
            자동발송 메일입니다.
          </p>
        </div>
      </div>
    `
  })
};