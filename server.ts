import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with required User-Agent
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * Endpoint for complex medical case, complaint, and SLA analysis
 * Uses gemini-3.1-pro-preview with ThinkingLevel.HIGH
 * Note: maxOutputTokens is intentionally omitted per requirements.
 */
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { caseDetails, patientHistory, branch, purpose, doctor, urgency, complaintType } = req.body;

    if (!caseDetails) {
      return res.status(400).json({ error: 'Case details are required' });
    }

    const ai = getAiClient();

    const systemPrompt = `أنت المستشار الطبي والإداري الخبير لمركز اتصالات مجموعة إكسبرتس كير الطبية (Experts-Care Medical Group).
مهمتك إجراء تحليل سريري وتشغيلي عميق وشامل لأي حالة معقدة أو شكوى أو طلب وارد في مركز الاتصال الطبي.
قم بالتفكير التحليلي العميق في:
1. الجانب الطبي والسريري (درجة الخطورة، الأعراض، مدى ملاءمة التخصص أو الطبيب).
2. الجانب التشغيلي واتفاقية مستوى الخدمة SLA (خطر تجاوز الوقت، التنسيق مع الفرع، وتصعيد الحالة).
3. الجانب النفسي وتجربة المريض (تحليل المشاعر، تخفيف التوتر، والتعاطف الطبي الفعّال).
4. خطة عمل واضحة وتوصيات إجرائية فورية للموظف والمشرف.
5. صياغة رد احترافي مقترح يتلوه الموظف على المريض هاتفياً أو عبر واتساب.`;

    const userPrompt = `يرجى تقديم تحليل شامل وتفكير متعمق للحالة التالية:
- الفرع: ${branch || 'غير محدد'}
- سبب الاتصال: ${purpose || 'غير محدد'}
- نوع الشكوى أو الحالة: ${complaintType || 'غير محدد'}
- الطبيب المرتبط: ${doctor || 'غير محدد'}
- مستوى الاستعجال: ${urgency || 'عادي'}
- تفاصيل الحالة / ملاحظات الموظف:
"""${caseDetails}"""
${patientHistory ? `- تاريخ المريض السابق: ${patientHistory}` : ''}

قم بتزويدي بالتحليل باللغة العربية بصيغة JSON واضحة بالهيكل التالي:
{
  "clinicalRiskAssessment": "تقييم الخطورة السريرية (منخفض / متوسط / حرج مع التفسير)",
  "rootCauseAnalysis": "التحليل الجذري للمشكلة أو الشكوى",
  "slaRiskLevel": "مستوى خطر تجاوز SLA والتوصية الزمنية الفورية",
  "suggestedSpecialtyAlignment": "هل القسم أو الطبيب ملائم أم يحتاج تحويل تخصصي آخر",
  "recommendedActionSteps": ["خطوة 1", "خطوة 2", "خطوة 3"],
  "suggestedPatientScript": "نص الرد الهاتفي المقترح للموظف بأسلوب مهني وودود",
  "preventativeMeasures": "إجراءات وقائية لمنع تكرار الشكوى مستقبلاً",
  "sentimentSummary": "ملخص المشاعر والانطباع العام"
}`;

    // Calling gemini-3.1-pro-preview with ThinkingLevel.HIGH and no maxOutputTokens
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      parsedResult = {
        clinicalRiskAssessment: 'تم التحليل',
        rootCauseAnalysis: responseText,
        recommendedActionSteps: ['متابعة الحالة مع المشرف المناوب'],
        suggestedPatientScript: 'نعتذر عن أي إزعاج، ونعمل حالياً على خدمتكم على أكمل وجه.'
      };
    }

    return res.json({ success: true, analysis: parsedResult });
  } catch (err: any) {
    console.error('Error in /api/gemini/analyze:', err);

    // Fallback if paid model requires setup or API key limitation occurs
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to complete analysis with high thinking model',
      requiresPaidKey: err?.message?.includes('403') || err?.message?.includes('PERMISSION_DENIED')
    });
  }
});

// Setup Vite middleware in dev or serve build in production
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Experts-Care CRM v27] Server running on http://0.0.0.0:${PORT}`);
});
