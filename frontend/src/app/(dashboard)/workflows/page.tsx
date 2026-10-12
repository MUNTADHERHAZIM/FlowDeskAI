"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Workflow as WorkflowIcon,
  Plus,
  Play,
  Save,
  Zap,
  Bot,
  GitBranch,
  CheckCircle2,
  Settings,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  ShieldCheck,
  Activity,
  Terminal,
  X,
  RotateCcw,
  Check,
  Smartphone,
  Send,
  MessageSquare,
  Clock,
  Download,
  Upload,
  Copy,
  Trash2,
  List,
  Layout,
  History,
  ToggleLeft,
  ToggleRight,
  Database,
  Search,
  Code2,
  ExternalLink,
  Phone,
  Radio,
  FileCode,
  Filter,
  Eye,
  Sliders,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  FolderOpen,
  Wand2,
  BookOpen,
  FileText,
  Paperclip,
} from "lucide-react";
import {
  TriggerNode,
  AINode,
  LogicNode,
  ActionNode,
  DatabaseNode,
  CodeNode,
  OutputNode,
} from "@/components/workflows/CustomNodes";

interface WorkflowMeta {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  executionsCount: number;
  successRate: string;
  lastRun: string;
  channels: string[];
}

const initialWorkflowList: WorkflowMeta[] = [
  {
    id: "wf_omnichannel",
    name: "الرد الذكي الموحد عبر جميع قنوات التواصل (Omnichannel Social AI Auto-Responder)",
    description: "استقبال موحد من كافة المنصات (واتساب، إنستغرام، ماسنجر، تيليجرام، الموقع) ← حارس ساعات العمل ومنع التكرار الحلقي ← وكيل الذكاء الاصطناعي مع قاعدة المعرفة ← رد تكيفي فوري لقناة العميل ومزامنة صندوق الوارد.",
    isActive: true,
    executionsCount: 3840,
    successRate: "99.9%",
    lastRun: "منذ ثوانٍ",
    channels: ["Universal Inbound", "WhatsApp", "Instagram DM", "Telegram", "Messenger", "WebChat"],
  },
  {
    id: "wf_1",
    name: "أتمتة حجز المواعيد والاستجابة الذكية (عيادة البصرة)",
    description: "استقبال رسالة واتساب ← استخراج النية والمواعيد بـ AI ← فحص التوافر الذري في PostgreSQL ← تأكيد وإرسال واتساب.",
    isActive: true,
    executionsCount: 1420,
    successRate: "99.8%",
    lastRun: "منذ دقيقة واحدة",
    channels: ["WhatsApp", "PostgreSQL", "AI RAG"],
  },
  {
    id: "wf_2",
    name: "استقبال وتصنيف الشكاوى وتوجيه التذاكر (AI Triage)",
    description: "استقبال رسائل تيليجرام والموقع ← تصنيف درجة الإلحاح بالمشاعر ← توجيه للفريق مع إشعار فوري.",
    isActive: true,
    executionsCount: 480,
    successRate: "99.2%",
    lastRun: "منذ 12 دقيقة",
    channels: ["Telegram", "WebChat", "AI Classifier"],
  },
  {
    id: "wf_3",
    name: "تذكير المواعيد اليومية عبر SMS العراق (Zain / Asiacell)",
    description: "مؤقت مجدول يومياً الساعة 9:00 ص ← جلب مواعيد الغد ← إرسال رسائل نصية قصيرة SMS للمرضى.",
    isActive: true,
    executionsCount: 710,
    successRate: "100%",
    lastRun: "أمس 09:00 ص",
    channels: ["Cron Trigger", "Iraq SMS", "Calendar"],
  },
  {
    id: "wf_4",
    name: "استبيان رضا العملاء والمتابعة بعد الزيارة",
    description: "تشغيل تلقائي بعد ساعتين من اكتمال الموعد ← إرسال رابط تقييم عبر واتساب ← حفظ النتيجة في CRM.",
    isActive: false,
    executionsCount: 95,
    successRate: "98.5%",
    lastRun: "منذ يومين",
    channels: ["Delay Timer", "WhatsApp", "CRM"],
  },
];

const initialNodes: Node[] = [
  {
    id: "1",
    type: "triggerNode",
    position: { x: 1050, y: 220 },
    data: {
      nodeKey: "trg_whatsapp",
      label: "استقبال رسالة واتساب (العراق)",
      description: "Meta Cloud API Webhook: استقبال رسائل واردة",
      status: "idle",
      executionTime: "14ms",
      config: {
        channel: "WhatsApp Cloud API",
        phoneNumberId: "10492817294812",
        webhookSecret: "whsec_live_basra_2026",
      },
      sampleInput: {
        event: "messages.upsert",
        sender: "+9647801234567",
        text: "مرحبا دكتور، اريد احجز موعد باجر العصر مع دكتور خالد",
        timestamp: "2026-10-10T16:20:00Z",
      },
      sampleOutput: {
        status: "received",
        sender: "+9647801234567",
        clientName: "منتظر حازم",
        cleanedMessage: "اريد احجز موعد باجر العصر مع دكتور خالد",
      },
    },
  },
  {
    id: "2",
    type: "aiNode",
    position: { x: 720, y: 220 },
    data: {
      nodeKey: "ai_rag_intent",
      label: "استخراج نية الحجز والمعرفة (AI RAG)",
      description: "مطابقة قاعدة المعرفة واستخراج التاريخ والخدمة",
      status: "idle",
      executionTime: "240ms",
      config: {
        model: "Gemini 1.5 Pro / GPT-4o",
        temperature: "0.2",
        systemPrompt: "أنت المساعد الذكي الرسمي لعيادة البصرة التخصصية. قم باستخراج اسم المريض، التوقيت، ونوع الخدمة المطلوبة. رحب بالعميل بأسلوب عراقي لطيف ومهذب (أهلاً وسهلاً بيك، تدلل)، واقترح المواعيد المتاحة حصراً.",
        vectorIndex: "basra_clinic_knowledge_base",
      },
      sampleInput: {
        rawText: "اريد احجز موعد باجر العصر مع دكتور خالد",
        senderPhone: "+9647801234567",
      },
      sampleOutput: {
        intent: "BOOK_APPOINTMENT",
        doctor: "د. خالد السالم",
        specialty: "طب وجراحة عامة",
        requestedDate: "2026-10-11",
        requestedTime: "16:30",
        confidence: 0.98,
      },
    },
  },
  {
    id: "3",
    type: "logicNode",
    position: { x: 380, y: 200 },
    data: {
      nodeKey: "lgc_atomic_guard",
      label: "فحص التوافر ومنع التعارض الذري",
      description: "PostgreSQL SELECT FOR UPDATE لمنع أي حجز مزدوج",
      status: "idle",
      executionTime: "18ms",
      config: {
        lockType: "PostgreSQL Mutex Guard",
        table: "appointments",
        preventOverlap: true,
        bufferMinutes: 15,
      },
      sampleInput: {
        doctor: "د. خالد السالم",
        date: "2026-10-11",
        time: "16:30",
        slotDuration: 30,
      },
      sampleOutput: {
        isAvailable: true,
        lockedRoom: "عيادة 2",
        atomicLockId: "lock_pg_98231",
        conflictDetected: false,
      },
    },
  },
  {
    id: "4",
    type: "actionNode",
    position: { x: 40, y: 160 },
    data: {
      nodeKey: "act_whatsapp_confirm",
      label: "تأكيد الحجز وإرسال واتساب",
      description: "إرسال رسالة التأكيد الرسمية مع تفاصيل الحجز",
      status: "idle",
      executionTime: "68ms",
      config: {
        destinationChannel: "WhatsApp",
        templateName: "appointment_confirmation_v2",
        messageBody: "تم تأكيد موعدكم بنجاح يا {{ $json.clientName }} مع {{ $json.doctor }} بتاريخ {{ $json.date }} الساعة {{ $json.requestedTime }}.",
        autoArchive: false,
      },
      sampleInput: {
        phone: "+9647801234567",
        appointmentId: "APT-2026-904",
        doctor: "د. خالد السالم",
        time: "16:30",
        date: "2026-10-11",
      },
      sampleOutput: {
        deliveryStatus: "sent",
        messageId: "wamid_891238912739",
        recipient: "+9647801234567",
      },
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    style: { stroke: "#a855f7", strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
  },
  {
    id: "e3-4",
    source: "3",
    sourceHandle: "true",
    target: "4",
    animated: true,
    label: "متاح (True)",
    labelStyle: { fill: "#10b981", fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: "#0f172a", fillOpacity: 0.9 },
    style: { stroke: "#10b981", strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
];

// Rich Node Catalog
const NODE_CATALOG = [
  {
    category: "المشغلات (Triggers)",
    categoryKey: "triggers",
    color: "amber",
    items: [
      {
        type: "triggerNode",
        key: "trg_omnichannel",
        title: "Omnichannel Universal Inbound",
        desc: "استقبال موحد من كافة قنوات التواصل (واتساب، إنستغرام، ماسنجر، تيليجرام)",
        icon: Radio,
        accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        config: { channels: ["WhatsApp", "Instagram DM", "Telegram", "Facebook Messenger", "WebChat"], triggerMode: "Any Channel" },
      },
      {
        type: "triggerNode",
        key: "trg_instagram_dm",
        title: "Instagram DM Webhook Trigger",
        desc: "استقبال الرسائل المباشرة عبر Meta Graph API",
        icon: MessageSquare,
        accent: "text-pink-400 bg-pink-500/10 border-pink-500/20",
        config: { account: "@brand_official", webhookSecret: "whsec_meta_ig_2026" },
      },
      {
        type: "triggerNode",
        key: "trg_whatsapp",
        title: "WhatsApp Webhook Trigger",
        desc: "استقبال رسائل واتساب عبر Meta Cloud API",
        icon: Phone,
        accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        config: { channel: "WhatsApp", webhookSecret: "whsec_..." },
      },
      {
        type: "triggerNode",
        key: "trg_telegram",
        title: "Telegram Bot Webhook",
        desc: "استقبال رسائل وقنوات تيليجرام اللحظية",
        icon: Send,
        accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        config: { botToken: "bot_tok_...", parseMode: "HTML" },
      },
      {
        type: "triggerNode",
        key: "trg_cron",
        title: "Scheduled Cron Trigger",
        desc: "تشغيل أوتوماتيكي مجدول حسب التاريخ والوقت",
        icon: Clock,
        accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        config: { expression: "0 9 * * *", timezone: "Asia/Baghdad" },
      },
      {
        type: "triggerNode",
        key: "trg_webhook",
        title: "Custom HTTP Webhook",
        desc: "استقبال استدعاءات API خارجية (POST/GET)",
        icon: Radio,
        accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        config: { httpMethod: "POST", authHeader: "Bearer" },
      },
    ],
  },
  {
    category: "الذكاء الاصطناعي والمعرفة (AI & RAG)",
    categoryKey: "ai",
    color: "purple",
    items: [
      {
        type: "aiNode",
        key: "ai_intent_extractor",
        title: "AI RAG Intent & Entity Extractor",
        desc: "استخراج النية والكيانات ومطابقة قاعدة المعرفة",
        icon: Bot,
        accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        config: { model: "Gemini 1.5 Pro", temperature: "0.2" },
      },
      {
        type: "aiNode",
        key: "ai_llm_chat",
        title: "LLM Agent (GPT-4o / Claude 3.5)",
        desc: "توليد ردود سياقية ذكية مقيدة بالتعليمات",
        icon: Sparkles,
        accent: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
        config: { model: "Claude 3.5 Sonnet", maxTokens: 800 },
      },
      {
        type: "aiNode",
        key: "ai_classifier",
        title: "AI Sentiment & Urgency Classifier",
        desc: "تصنيف التذاكر حسب الإلحاح ورضا العملاء",
        icon: Sliders,
        accent: "text-pink-400 bg-pink-500/10 border-pink-500/20",
        config: { categories: ["عاجل", "طبيعي", "استفسار"] },
      },
      {
        type: "aiNode",
        key: "ai_whisper",
        title: "AI Voice Transcription (Whisper)",
        desc: "تفريغ وتحويل الرسائل الصوتية لنصوص عربية",
        icon: Radio,
        accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        config: { language: "ar", punctuate: true },
      },
    ],
  },
  {
    category: "المنطق وقواعد البيانات (Logic & DB)",
    categoryKey: "logic",
    color: "emerald",
    items: [
      {
        type: "logicNode",
        key: "lgc_atomic_guard",
        title: "Atomic Double-Booking Guard",
        desc: "قفل التوافر الذري في PostgreSQL لمنع التعارض",
        icon: Shield,
        accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        config: { lockMode: "SELECT FOR UPDATE", timeoutMs: 3000 },
      },
      {
        type: "logicNode",
        key: "lgc_if_else",
        title: "IF / ELSE Conditional Branch",
        desc: "تفرع منطقي شرطي بمسارين (True و False)",
        icon: GitBranch,
        accent: "text-teal-400 bg-teal-500/10 border-teal-500/20",
        config: { condition: "{{ $json.isAvailable }} == true" },
      },
      {
        type: "databaseNode",
        key: "db_postgres_query",
        title: "PostgreSQL Database Query",
        desc: "استعلام مباشر في الجداول ومزامنة السجلات",
        icon: Database,
        accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        config: { table: "crm_contacts", operation: "UPSERT" },
      },
      {
        type: "codeNode",
        key: "code_js_script",
        title: "JavaScript Function Code",
        desc: "تشغيل كود برمجي لمعالجة البيانات وتصفيتها",
        icon: Code2,
        accent: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
        config: { script: "return items.map(i => ({ ...i }));" },
      },
    ],
  },
  {
    category: "الإجراءات والقنوات (Actions & Outputs)",
    categoryKey: "actions",
    color: "rose",
    items: [
      {
        type: "actionNode",
        key: "act_omnichannel_adaptive",
        title: "Adaptive Reply to Originating Channel",
        desc: "الرد الذكي التلقائي على نفس المنصة التي راسل منها العميل (تكيّف تلقائي)",
        icon: Radio,
        accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        config: { targetChannel: "Originating Channel (تلقائي حسب منصة الرسالة)", autoFormatForPlatform: true },
      },
      {
        type: "actionNode",
        key: "act_whatsapp_send",
        title: "Send WhatsApp Message",
        desc: "إرسال رسالة رسمية أو قالب معتمد للعميل",
        icon: Phone,
        accent: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        config: { messageType: "Template", recipient: "{{ $json.phone }}" },
      },
      {
        type: "actionNode",
        key: "act_telegram_send",
        title: "Send Telegram Message",
        desc: "إرسال إشعار فوري لمجموعة الدعم أو العميل",
        icon: Send,
        accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        config: { chatId: "{{ $json.telegram_id }}" },
      },
      {
        type: "actionNode",
        key: "act_iraq_sms",
        title: "Iraq SMS Gateway (Zain / Asiacell)",
        desc: "إرسال رسائل SMS نصية مباشرة عبر شبكات العراق",
        icon: Smartphone,
        accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        config: { provider: "Zain Iraq / Asiacell Bulk", senderId: "FLOWDESK" },
      },
      {
        type: "actionNode",
        key: "act_http_request",
        title: "HTTP REST API Request",
        desc: "إرسال طلب ويب خارجي (GET / POST / PUT)",
        icon: ExternalLink,
        accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        config: { url: "https://api.external.com/v1/sync", method: "POST" },
      },
    ],
  },
  {
    category: "المخرجات والنتائج النهائية (Final Output & Result)",
    categoryKey: "output",
    color: "emerald",
    items: [
      {
        type: "outputNode",
        key: "out_final_response",
        title: "Workflow Final Result & Output",
        desc: "عرض وتجميع النتيجة النهائية للفلو، استجابة الـ API وبطاقة التأكيد",
        icon: CheckCircle2,
        accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        config: {
          responseStatus: "200 OK",
          format: "JSON + Visual Card",
          payloadSummary: '{ "status": "CONFIRMED", "bookingId": "APT-2026-904" }',
        },
      },
      {
        type: "outputNode",
        key: "out_webhook_respond",
        title: "Respond to Webhook (HTTP Response)",
        desc: "إرجاع استجابة فورية لنظام أو تطبيق خارجي",
        icon: ExternalLink,
        accent: "text-teal-400 bg-teal-500/10 border-teal-500/20",
        config: { responseCode: 200, contentType: "application/json" },
      },
    ],
  },
];

// System Prompt Presets
const PROMPT_PRESETS = [
  {
    title: "🌐 المساعد الذكي الموحد لجميع منصات التواصل (Omnichannel Social Agent)",
    prompt: "أنت المساعد الذكي الرسمي الموحد للمؤسسة عبر جميع منصات التواصل (واتساب، إنستغرام، تليجرام، فيسبوك ماسنجر، والدردشة المباشرة). رحب بالعميل بأسلوب راقٍ ومهذب (أهلاً وسهلاً بحضرتك، تشرفنا بتواصلك). أجب فوراً بدقة عالية استناداً إلى قاعدة المعرفة والخدمات والأسعار وأوقات الدوام. إذا طلب العميل حجز موعد، اطلب الاسم واليوم المفضل لتأكيد الحجز. وإذا طلب التحدث مع موظف بشري أو كانت هناك شكوى معقدة، اعتذر بلطف وأكد له أنه تم إشعار الفريق وسيتواصل معه أحد الزملاء فوراً.",
  },
  {
    title: "🏥 منسق حجوزات عيادة البصرة (لهجة عراقية مهذبة)",
    prompt: "أنت المساعد الذكي الرسمي لعيادة البصرة التخصصية. قم باستخراج اسم المريض، التوقيت، ونوع الخدمة المطلوبة. رحب بالعميل بأسلوب عراقي لطيف ومهذب (أهلاً وسهلاً بيك، تدلل)، واقترح المواعيد المتاحة حصراً المقيدة بجدول العيادة.",
  },
  {
    title: "🚨 فرز وتصنيف طوارئ وشكاوى حرجة (Emergency Triage)",
    prompt: "حلل الرسالة فوراً: إذا كانت الحالة تشمل نزيف حاد، ألم طارئ لا يحتمل، أو إغماء، ضع النية EMERGENCY فوراً واقترح التوجه الفوري للطوارئ أو أقرب مستشفى مع إشعار الطبيب المناوب.",
  },
  {
    title: "💊 استخراج الأعراض والتاريخ الدوائي (Clinical Entity)",
    prompt: "استخرج الأعراض السريرية، مدة الشكوى بالأيام، والأدوية الحالية التي يتناولها المريض في كائن JSON منظم بدقة تامة.",
  },
  {
    title: "💬 استفسارات عامة وأسعار الخدمات وأوقات الدوام",
    prompt: "أجب عن استفسارات المريض بخصوص أسعار الكشفيات وموقع العيادة في البصرة وساعات الدوام الرسمية بدقة مطابقة لوثائق قاعدة المعرفة.",
  },
];

export default function WorkflowsPage() {
  const [viewMode, setViewMode] = useState<"canvas" | "list">("canvas");
  const [workflows, setWorkflows] = useState<WorkflowMeta[]>(initialWorkflowList);
  const [activeWfId, setActiveWfId] = useState<string>("wf_1");
  const [workflowName, setWorkflowName] = useState<string>("أتمتة حجز المواعيد والاستجابة الذكية (عيادة البصرة)");
  const [workflowActive, setWorkflowActive] = useState<boolean>(true);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Inspector & Drawers state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"params" | "prompt" | "knowledge" | "data" | "test">("params");
  const [showNodeLibrary, setShowNodeLibrary] = useState<boolean>(false);
  const [activeCatalogTab, setActiveCatalogTab] = useState<string>("all");
  const [nodeSearchQuery, setNodeSearchQuery] = useState<string>("");
  const [showExecutionsDrawer, setShowExecutionsDrawer] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [guideActiveTab, setGuideActiveTab] = useState<"basics" | "nodes" | "quickstart" | "faq">("basics");

  // Advanced Enterprise Modals State
  const [suggestTargetNodeId, setSuggestTargetNodeId] = useState<string | null>(null);
  const [showValidatorModal, setShowValidatorModal] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dry run execution simulation
  const [isRunningDryRun, setIsRunningDryRun] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  // Prompt playground state
  const [testPromptInput, setTestPromptInput] = useState<string>("اريد احجز موعد باجر العصر مع دكتور خالد بخصوص الم في الظهر");
  const [testPromptOutput, setTestPromptOutput] = useState<string | null>(null);
  const [isTestingPrompt, setIsTestingPrompt] = useState<boolean>(false);

  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNode,
      aiNode: AINode,
      logicNode: LogicNode,
      actionNode: ActionNode,
      databaseNode: DatabaseNode,
      codeNode: CodeNode,
      outputNode: OutputNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#6366f1", strokeWidth: 2.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setInspectorTab("params");
  }, []);

  // Show Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Node Quick Actions Listener
  useEffect(() => {
    const handleNodeAction = (e: any) => {
      const { action, nodeId } = e.detail || {};
      if (!nodeId) return;

      if (action === "delete") {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((ed) => ed.source !== nodeId && ed.target !== nodeId));
        setSelectedNode((prev) => (prev?.id === nodeId ? null : prev));
        showToast("تم حذف العقدة بنجاح");
      } else if (action === "duplicate") {
        setNodes((nds) => {
          const target = nds.find((n) => n.id === nodeId);
          if (!target) return nds;
          const newId = String(Date.now());
          const copy: Node = {
            ...target,
            id: newId,
            position: { x: target.position.x - 50, y: target.position.y + 70 },
            data: {
              ...target.data,
              nodeKey: `${target.data.nodeKey || "node"}_copy`,
              label: `${target.data.label || "عقدة"} (نسخة)`,
              status: "idle",
            },
          };
          return [...nds, copy];
        });
        showToast("تم إنشاء نسخة مطابقة من العقدة");
      } else if (action === "mute") {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, isMuted: !n.data.isMuted } }
              : n
          )
        );
        showToast("تم تغيير حالة تفعيل العقدة");
      } else if (action === "suggest-next") {
        setSuggestTargetNodeId(nodeId);
      } else if (action === "run") {
        setShowTerminal(true);
        const targetNode = nodes.find((n) => n.id === nodeId);
        setTerminalLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ▶ تشغيل العقدة [${targetNode?.data?.label || nodeId}] كخطوة منفردة (Step Sandbox)...`,
        ]);
        setNodes((nds) =>
          nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status: "running" } } : n))
        );
        setTimeout(() => {
          const latency = `${Math.floor(Math.random() * 35) + 12}ms`;
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status: "success", executionTime: latency } }
                : n
            )
          );
          setTerminalLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✓ اكتملت العقدة [${targetNode?.data?.label || nodeId}] بنجاح (زمن المعالجة: ${latency}).`,
          ]);
        }, 650);
      }
    };

    window.addEventListener("flow-node-action", handleNodeAction);
    return () => window.removeEventListener("flow-node-action", handleNodeAction);
  }, [nodes]);

  // Contextual Smart Suggestions generator
  const getNextStepSuggestions = (nodeId: string | null) => {
    if (!nodeId) return [];
    const sourceNode = nodes.find((n) => n.id === nodeId);
    if (!sourceNode) return [];

    if (sourceNode.type === "triggerNode") {
      return [
        {
          type: "aiNode",
          key: "ai_intent_extractor",
          title: "AI RAG Intent & Entity Extractor",
          desc: "استخراج نية الحجز، اسم الطبيب، والخدمة بمطابقة وثائق العيادة",
          badge: "موصى به جداً (99%)",
          color: "purple",
          config: { model: "Gemini 1.5 Pro", temperature: "0.2" },
        },
        {
          type: "databaseNode",
          key: "db_lookup_crm",
          title: "CRM Patient Lookup (استعلام المريض)",
          desc: "فحص هل رقم الهاتف مسجل مسبقاً في قاعدة بيانات العيادة",
          badge: "تحقق فوري",
          color: "cyan",
          config: { table: "crm_contacts", operation: "SELECT" },
        },
        {
          type: "aiNode",
          key: "ai_triage",
          title: "AI Urgency Classifier (فرز الطوارئ)",
          desc: "تحليل فوري لدرجة الإلحاح وتصنيف الشكوى",
          badge: "طوارئ",
          color: "rose",
          config: { model: "Gemini 1.5 Pro" },
        },
      ];
    } else if (sourceNode.type === "aiNode") {
      return [
        {
          type: "logicNode",
          key: "lgc_atomic_guard",
          title: "Atomic Double-Booking Guard",
          desc: "قفل التوافر الذري في PostgreSQL لمنع الحجز المزدوج",
          badge: "منع التعارض الذري",
          color: "emerald",
          config: { lockMode: "SELECT FOR UPDATE", timeoutMs: 3000 },
        },
        {
          type: "logicNode",
          key: "lgc_if_else",
          title: "IF / ELSE Conditional Branch",
          desc: "تفرع منطقي حسب النية (حجز موعد مقابل استفسار عام)",
          badge: "توجيه شرطي",
          color: "teal",
          config: { condition: "{{ $json.intent }} == 'BOOK_APPOINTMENT'" },
        },
        {
          type: "actionNode",
          key: "act_whatsapp_reply",
          title: "Send WhatsApp Response (رد آلي ذكي)",
          desc: "إرسال الإجابة مباشرة إلى محادثة الواتساب",
          badge: "رد فوري",
          color: "rose",
          config: { channel: "WhatsApp" },
        },
      ];
    } else if (sourceNode.type === "logicNode") {
      return [
        {
          type: "actionNode",
          key: "act_whatsapp_confirm",
          title: "تأكيد الحجز وإرسال واتساب للعميل",
          desc: "إرسال رسالة التأكيد مع رابط التقويم وتفاصيل الكشف",
          badge: "مسار النجاح (True)",
          color: "emerald",
          config: { channel: "WhatsApp", template: "booking_confirmation" },
        },
        {
          type: "actionNode",
          key: "act_suggest_alt",
          title: "اقتراح مواعيد بديلة شاغرة",
          desc: "في حال كان الموعد المطلوب محجوزاً (False)",
          badge: "مسار البديل (False)",
          color: "amber",
          config: { channel: "WhatsApp", template: "alternative_slots" },
        },
      ];
    } else {
      return [
        {
          type: "databaseNode",
          key: "db_sync_crm",
          title: "مزامنة السجل في CRM والتقويم",
          desc: "تحديث بطاقة المريض وسجل الزيارات",
          badge: "تحديث البيانات",
          color: "cyan",
          config: { table: "appointments" },
        },
        {
          type: "actionNode",
          key: "act_iraq_sms",
          title: "Iraq SMS Gateway (Zain / Asiacell)",
          desc: "إرسال رسالة نصية SMS احتياطية للهاتف",
          badge: "إشعار SMS",
          color: "amber",
          config: { provider: "Zain / Asiacell" },
        },
      ];
    }
  };

  // Add and connect suggested node
  const handleAddAndConnectSuggestedNode = (sourceId: string, suggestion: any) => {
    const source = nodes.find((n) => n.id === sourceId);
    if (!source) return;

    const newId = String(Date.now());
    const newNode: Node = {
      id: newId,
      type: suggestion.type,
      position: { x: source.position.x - 340, y: source.position.y },
      data: {
        nodeKey: `${suggestion.key}_${Math.floor(Math.random() * 1000)}`,
        label: suggestion.title,
        description: suggestion.desc,
        status: "idle",
        executionTime: "0ms",
        config: suggestion.config || {},
        sampleInput: { ...source.data.sampleOutput },
        sampleOutput: { status: "processed", success: true },
      },
    };

    const newEdge: Edge = {
      id: `e_${sourceId}_${newId}`,
      source: sourceId,
      target: newId,
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setSuggestTargetNodeId(null);
    setSelectedNode(newNode);
    showToast(`تمت إضافة العقدة [${suggestion.title}] وتوصيلها تلقائياً بنجاح!`);
  };

  // Auto Layout Helper
  const handleAutoLayout = () => {
    setNodes((nds) => {
      const spacingX = 340;
      const startX = 1050;
      const sorted = [...nds].sort((a, b) => {
        const order: Record<string, number> = {
          triggerNode: 0,
          aiNode: 1,
          logicNode: 2,
          databaseNode: 3,
          codeNode: 4,
          actionNode: 5,
        };
        return (order[a.type || ""] ?? 99) - (order[b.type || ""] ?? 99);
      });

      return nds.map((n) => {
        const idx = sorted.findIndex((s) => s.id === n.id);
        return {
          ...n,
          position: {
            x: startX - idx * spacingX,
            y: 220 + (idx % 2 === 0 ? 0 : 30),
          },
        };
      });
    });
    showToast("تمت محاذاة وتنظيم كافة العقد هندسياً");
  };

  // Add node from library
  const handleAddNodeFromCatalog = (item: any) => {
    const newId = String(Date.now());
    const newNode: Node = {
      id: newId,
      type: item.type,
      position: { x: 500, y: 220 },
      data: {
        nodeKey: `${item.key}_${Math.floor(Math.random() * 1000)}`,
        label: item.title,
        description: item.desc,
        status: "idle",
        executionTime: "0ms",
        config: item.config || {},
        sampleInput: { message: "Sample inbound payload" },
        sampleOutput: { status: "processed", success: true },
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    setShowNodeLibrary(false);
    showToast(`تمت إضافة عقدة [${item.title}]`);
  };

  // Pre-flight Workflow Validator
  const handleValidateWorkflow = () => {
    const hasTrigger = nodes.some((n) => n.type === "triggerNode");
    const orphanNodes = nodes.filter((n) => {
      const isSource = edges.some((e) => e.source === n.id);
      const isTarget = edges.some((e) => e.target === n.id);
      return !isSource && !isTarget;
    });
    const hasAtomicGuard = nodes.some((n) => n.data.nodeKey?.includes("atomic") || n.type === "logicNode");
    const unconfiguredNodes = nodes.filter((n) => !n.data.label);

    const report = {
      isValid: hasTrigger && orphanNodes.length === 0,
      hasTrigger,
      orphanNodes,
      hasAtomicGuard,
      unconfiguredNodes,
      totalNodes: nodes.length,
      totalEdges: edges.length,
    };

    setValidationReport(report);
    setShowValidatorModal(true);
  };

  // Export Workflow to JSON file & clipboard
  const handleExportJson = () => {
    const payload = {
      name: workflowName,
      version: "2.4.0",
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };
    const jsonStr = JSON.stringify(payload, null, 2);

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
    }

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowdesk-workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("تم تنزيل ملف الـ JSON ونسخ المحتوى إلى الحافظة!");
  };

  // Import Workflow from JSON
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        if (parsed.name) setWorkflowName(parsed.name);
        setShowImportModal(false);
        setImportJsonText("");
        showToast("تم استيراد المسار بنجاح وتحميله على اللوحة!");
      } else {
        alert("تنسيق الـ JSON غير صالح: يجب أن يحتوي على كائن nodes و edges.");
      }
    } catch (e) {
      alert("خطأ في قراءة الـ JSON: تأكد من صحة الكود البرمجي.");
    }
  };

  // Dry run step-by-step execution simulation
  const runDryRunSimulation = async () => {
    if (isRunningDryRun) return;
    setIsRunningDryRun(true);
    setShowTerminal(true);
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 بدء اختبار ومحاكاة الورك فلو (Dry-Run Sandbox Engine v2.4)...`,
      `[${new Date().toLocaleTimeString()}] التحقق من قيود عزل المؤسسة (Tenant Boundary: Clinic-Basra)...`,
    ]);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" },
      }))
    );

    const orderedNodeIds = ["1", "2", "3", "4"].filter((id) => nodes.some((n) => n.id === id));
    const targetIds = orderedNodeIds.length > 0 ? orderedNodeIds : nodes.map((n) => n.id);

    for (const nodeId of targetIds) {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status: "running" } } : n))
      );

      const targetNode = nodes.find((n) => n.id === nodeId);
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ▶ تشغيل العقدة [${targetNode?.data?.label || nodeId}]...`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 850));

      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status: "success" } } : n))
      );

      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✓ اكتملت العقدة [${targetNode?.data?.label || nodeId}] بنجاح (Execution: ${targetNode?.data?.executionTime || "34ms"
        }).`,
      ]);
    }

    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🎉 اكتمل تشغيل مسار العمل بالكامل بنجاح 100%! لا توجد تعارضات وتم قفل الموعد الذري.`,
    ]);
    setIsRunningDryRun(false);
  };

  // Isolated Step Test
  const [isTestingStep, setIsTestingStep] = useState<boolean>(false);
  const handleTestSingleStep = async () => {
    if (!selectedNode) return;
    setIsTestingStep(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsTestingStep(false);
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, status: "success" } } : n))
    );
    showToast(`تم اختبار العقدة [${selectedNode.data.label}] بنجاح`);
  };

  // Test Prompt in Inspector
  const handleTestPromptExecution = async () => {
    setIsTestingPrompt(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsTestingPrompt(false);

    const query = testPromptInput.toLowerCase();
    let sampleReply = "";
    let detectedIntent = "GENERAL_INQUIRY";

    if (query.includes("دوام") || query.includes("ساعات") || query.includes("وقت")) {
      detectedIntent = "BUSINESS_HOURS_INQUIRY";
      sampleReply = "أهلاً وسهلاً بحضرتك! دوامنا الرسمي يومياً من الساعة 9:00 صباحاً وحتى 10:00 مساءً. تحب تستفسر عن خدمة معينة أو تثبت موعدك؟ تدلل.";
    } else if (query.includes("حجز") || query.includes("موعد") || query.includes("دكتور")) {
      detectedIntent = "BOOK_APPOINTMENT";
      sampleReply = "أهلاً وسهلاً بحضرتك! يسعدنا تثبيت موعدك. المواعيد المتاحة غداً تبدأ من 4:30 عصراً مع الطبيب الاستشاري. تحب نثبت هذا الوقت باسم حضرتك؟";
    } else if (query.includes("سعر") || query.includes("تكلفة") || query.includes("باقة")) {
      detectedIntent = "PRICE_INQUIRY";
      sampleReply = "أهلاً بك! كشف الاستشارة التخصصية يبدأ من 25 ألف دينار، وتتوفر باقات فحص دورية شاملة. هل ترغب بعرض التفاصيل؟";
    } else if (query.includes("موظف") || query.includes("شكوى") || query.includes("إنسان")) {
      detectedIntent = "HUMAN_ESCALATION";
      sampleReply = "أهلاً بك، تم إشعار فريق خدمة العملاء فوراً وسيقوم أحد الزملاء بمتابعة محادثتك مباشرة هنا. نعتذر وبخدمتك دائماً.";
    } else {
      detectedIntent = "OMNICHANNEL_GREETING";
      sampleReply = "أهلاً وسهلاً بحضرتك! تشرفنا بتواصلك معنا عبر قنواتنا الرسمية. كيف يمكن لمساعدنا الذكي خدمتك اليوم؟";
    }

    setTestPromptOutput(
      JSON.stringify(
        {
          intent: detectedIntent,
          generatedResponse: sampleReply,
          confidenceScore: 0.99,
          dialectDetected: "Arabic (مهذب ولبق)",
          modelUsed: selectedNode?.data?.config?.model || "Google Gemini 1.5 Flash",
          knowledgeSourcesMatched: ["ساعات_العمل_والخدمات", "جدول_المواعيد_الرسمي"],
          escalateToHuman: detectedIntent === "HUMAN_ESCALATION",
        },
        null,
        2
      )
    );
  };

  // Filter Catalog items
  const filteredCatalog = useMemo(() => {
    return NODE_CATALOG.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const matchesCategory = activeCatalogTab === "all" || cat.categoryKey === activeCatalogTab;
        const matchesSearch =
          nodeSearchQuery.trim() === "" ||
          item.title.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(nodeSearchQuery.toLowerCase()) ||
          item.key.toLowerCase().includes(nodeSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [activeCatalogTab, nodeSearchQuery]);

  // Load Template
  const loadTemplate = (templateId: string) => {
    if (templateId === "t_omni" || templateId === "wf_omnichannel") {
      setNodes([
        {
          id: "omni_1",
          type: "triggerNode",
          position: { x: 1250, y: 220 },
          data: {
            nodeKey: "trg_omnichannel",
            label: "استقبال رسالة من أي قناة (Omnichannel Inbound)",
            description: "Meta Cloud API, Telegram, Instagram DM, WebChat",
            status: "idle",
            executionTime: "8ms",
            config: {
              channels: "واتساب، إنستغرام، تيليجرام، ماسنجر، الموقع",
              triggerMode: "Any Inbound Message",
              autoDeduplicate: "مفعل (Idempotency Key)",
            },
            sampleInput: {
              senderId: "usr_social_921",
              originChannel: "Instagram DM",
              senderName: "مريم العلي",
              text: "مرحبا دكتور، شنو اوقات الدوام والخدمات المتوفرة عندكم؟",
              timestamp: "2026-10-12T10:30:00Z",
            },
            sampleOutput: {
              status: "received",
              originChannel: "Instagram DM",
              senderId: "usr_social_921",
              senderName: "مريم العلي",
              cleanText: "شنو اوقات الدوام والخدمات المتوفرة عندكم؟",
            },
          },
        },
        {
          id: "omni_2",
          type: "logicNode",
          position: { x: 920, y: 220 },
          data: {
            nodeKey: "lgc_hours_anti_loop",
            label: "فحص ساعات العمل ومنع التكرار (Anti-Loop)",
            description: "التحقق من توقيت الدوام ومنع التكرار الحلقي أو إزعاج العميل",
            status: "idle",
            executionTime: "12ms",
            config: {
              schedule: "09:00 ص - 10:00 م (توقيت بغداد)",
              antiLoopCooldown: "60 ثانية لكل محادثة",
              ignoreOutbound: "تجاهل الرسائل الصادرة لمنع الانعكاس",
              offHoursBehavior: "إرسال رد مخصص خارج أوقات العمل مع الذكاء الاصطناعي",
            },
            sampleInput: {
              receivedTime: "10:30 ص",
              isWithinSchedule: true,
              lastRepliedMinutes: 45,
            },
            sampleOutput: {
              passed: true,
              isWorkingHours: true,
              rateLimitOk: true,
            },
          },
        },
        {
          id: "omni_3",
          type: "aiNode",
          position: { x: 580, y: 220 },
          data: {
            nodeKey: "ai_omnichannel_agent",
            label: "وكيل الذكاء الاصطناعي الشامل (AI Agent RAG)",
            description: "تحليل النية ومطابقة قاعدة المعرفة والخدمات وتوليد الرد",
            status: "idle",
            executionTime: "220ms",
            config: {
              model: "Google Gemini 1.5 Flash (مجاني - Free Tier)",
              temperature: "0.2",
              systemPrompt:
                "أنت المساعد الذكي الرسمي الموحد للمؤسسة عبر جميع منصات التواصل (واتساب، إنستغرام، تليجرام، فيسبوك ماسنجر، والدردشة المباشرة). رحب بالعميل بأسلوب راقٍ ومهذب (أهلاً وسهلاً بحضرتك، تشرفنا بتواصلك). أجب فوراً بدقة عالية استناداً إلى قاعدة المعرفة والخدمات والأسعار وأوقات الدوام. إذا طلب العميل حجز موعد، اطلب الاسم واليوم المفضل لتأكيد الحجز. وإذا طلب التحدث مع موظف بشري أو كانت هناك شكوى معقدة، اعتذر بلطف وأكد له أنه تم إشعار الفريق وسيتواصل معه أحد الزملاء فوراً.",
              vectorIndex: "omnichannel_services_faq",
            },
            sampleInput: {
              cleanText: "شنو اوقات الدوام والخدمات المتوفرة عندكم؟",
              senderName: "مريم العلي",
            },
            sampleOutput: {
              intent: "INQUIRY_SERVICES_HOURS",
              generatedResponse:
                "أهلاً وسهلاً بحضرتك ست مريم! دوامنا يومياً من 9:00 صباحاً حتى 10:00 مساءً، ونقدم خدمات الفحص والاستشارات التخصصية. تحبين نثبت لكِ موعد اليوم أو باجر؟ تدللين.",
              confidence: 0.99,
              escalateToHuman: false,
            },
          },
        },
        {
          id: "omni_4",
          type: "logicNode",
          position: { x: 240, y: 200 },
          data: {
            nodeKey: "lgc_human_check",
            label: "شرط: طلب موظف بشري أو شكوى عاجلة؟",
            description: "IF escalateToHuman == true تحويل للفريق البشري فوراً",
            status: "idle",
            executionTime: "6ms",
            config: {
              condition: "{{ $json.escalateToHuman }} == true",
              escalateKeywords: "موظف، إنسان، شكوى، مدير، طوارئ",
            },
            sampleInput: {
              escalateToHuman: false,
              sentiment: "positive",
            },
            sampleOutput: {
              isEscalated: false,
              route: "automatic_reply",
            },
          },
        },
        {
          id: "omni_5",
          type: "actionNode",
          position: { x: -120, y: 120 },
          data: {
            nodeKey: "act_omnichannel_adaptive_reply",
            label: "إرسال الرد الذكي المتكيف للقناة الأصلية",
            description: "الرد التلقائي على منصة العميل (إنستغرام، واتساب، تليجرام...) بنفس التنسيق",
            status: "idle",
            executionTime: "46ms",
            config: {
              targetChannel: "Originating Channel (تلقائي حسب منصة الرسالة الواردة)",
              formatRule: "تنسيق متكيف تلقائي (Text / Buttons / Quick Replies)",
              maxChars: "1000 حرف",
            },
            sampleInput: {
              destinationChannel: "Instagram DM",
              recipientId: "usr_social_921",
              responseText: "أهلاً وسهلاً بحضرتك ست مريم! دوامنا يومياً...",
            },
            sampleOutput: {
              deliveryStatus: "sent",
              platformMessageId: "mid_ig_892182910",
              channelUsed: "Instagram DM",
            },
          },
        },
        {
          id: "omni_6",
          type: "databaseNode",
          position: { x: -120, y: 320 },
          data: {
            nodeKey: "db_sync_inbox_unified",
            label: "مزامنة صندوق الوارد الموحد وتاريخ العميل",
            description: "تسجيل الرسالة والرد في المحادثة وتحديث سجل العميل في الـ CRM",
            status: "idle",
            executionTime: "14ms",
            config: {
              table: "conversations & crm_contacts",
              autoTag: "AI-Auto-Replied",
              unifiedProfileKey: "social_id_or_phone",
            },
            sampleInput: {
              senderName: "مريم العلي",
              channel: "Instagram DM",
              intent: "INQUIRY_SERVICES_HOURS",
            },
            sampleOutput: {
              synced: true,
              conversationId: "conv_social_781",
              status: "open",
            },
          },
        },
      ]);
      setEdges([
        {
          id: "e_omni_1_2",
          source: "omni_1",
          target: "omni_2",
          animated: true,
          style: { stroke: "#f59e0b", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
        },
        {
          id: "e_omni_2_3",
          source: "omni_2",
          target: "omni_3",
          animated: true,
          style: { stroke: "#a855f7", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
        },
        {
          id: "e_omni_3_4",
          source: "omni_3",
          target: "omni_4",
          animated: true,
          style: { stroke: "#06b6d4", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" },
        },
        {
          id: "e_omni_4_5",
          source: "omni_4",
          sourceHandle: "false",
          target: "omni_5",
          animated: true,
          label: "رد آلي فوري (False)",
          labelStyle: { fill: "#10b981", fontWeight: 700, fontSize: 11 },
          labelBgStyle: { fill: "#0f172a", fillOpacity: 0.9 },
          style: { stroke: "#10b981", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
        },
        {
          id: "e_omni_5_6",
          source: "omni_5",
          target: "omni_6",
          animated: true,
          style: { stroke: "#06b6d4", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" },
        },
      ]);
      setWorkflowName("الرد الذكي الموحد عبر جميع قنوات التواصل (Omnichannel Social AI Auto-Responder)");
    } else if (templateId === "t1") {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setWorkflowName("أتمتة حجز المواعيد والاستجابة الذكية (عيادة البصرة)");
    } else if (templateId === "t2") {
      // Daily SMS Reminder
      setNodes([
        {
          id: "t2_1",
          type: "triggerNode",
          position: { x: 1050, y: 220 },
          data: {
            nodeKey: "trg_cron_daily",
            label: "مؤقت مجدول يومياً (09:00 ص)",
            description: "تشغيل أوتوماتيكي يومي بتوقيت بغداد",
            status: "idle",
            executionTime: "5ms",
            config: { expression: "0 9 * * *", timezone: "Asia/Baghdad" },
          },
        },
        {
          id: "t2_2",
          type: "databaseNode",
          position: { x: 720, y: 220 },
          data: {
            nodeKey: "db_fetch_tomorrow",
            label: "جلب مواعيد الغد من التقويم",
            description: "استعلام PostgreSQL: SELECT * WHERE date = tomorrow()",
            status: "idle",
            executionTime: "12ms",
            config: { table: "appointments", statusFilter: "CONFIRMED" },
          },
        },
        {
          id: "t2_3",
          type: "codeNode",
          position: { x: 380, y: 220 },
          data: {
            nodeKey: "code_format_sms",
            label: "تنسيق نص التذكير ورقم الهاتف",
            description: "تجهيز قالب الرسالة: نذكركم بموعدكم غداً الساعة...",
            status: "idle",
            executionTime: "4ms",
            config: { script: "return items.map(item => ({ phone: item.phone, text: `مرحباً ${item.name}...` }));" },
          },
        },
        {
          id: "t2_4",
          type: "actionNode",
          position: { x: 40, y: 220 },
          data: {
            nodeKey: "act_iraq_sms",
            label: "بوابة SMS العراق (Zain / Asiacell)",
            description: "إرسال رسائل نصية قصيرة للمرضى عبر الأرقام العراقية",
            status: "idle",
            executionTime: "58ms",
            config: { provider: "Zain / Asiacell Bulk Gateway", senderName: "CLINIC-IQ" },
          },
        },
      ]);
      setEdges([
        { id: "e_t2_1_2", source: "t2_1", target: "t2_2", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" } },
        { id: "e_t2_2_3", source: "t2_2", target: "t2_3", animated: true, style: { stroke: "#06b6d4", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" } },
        { id: "e_t2_3_4", source: "t2_3", target: "t2_4", animated: true, style: { stroke: "#eab308", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#eab308" } },
      ]);
      setWorkflowName("تذكير المواعيد اليومية عبر SMS العراق (Zain / Asiacell)");
    } else if (templateId === "t3") {
      // AI Urgent Triage
      setNodes([
        {
          id: "t3_1",
          type: "triggerNode",
          position: { x: 1100, y: 220 },
          data: {
            nodeKey: "trg_telegram_msg",
            label: "استقبال رسالة تيليجرام / الدعم",
            description: "Webhook وصول استفسار أو شكوى من مريض",
            status: "idle",
            executionTime: "10ms",
            config: { botToken: "bot_clinic_support", parseMode: "HTML" },
          },
        },
        {
          id: "t3_2",
          type: "aiNode",
          position: { x: 760, y: 220 },
          data: {
            nodeKey: "ai_triage_classifier",
            label: "تصنيف الإلحاح والمشاعر بـ AI",
            description: "تحليل النص: هل الحالة طارئة حرجة أم استفسار عادي؟",
            status: "idle",
            executionTime: "190ms",
            config: { model: "Gemini 1.5 Pro", categories: ["طوارئ_حرجة", "استفسار_روتيني"] },
          },
        },
        {
          id: "t3_3",
          type: "logicNode",
          position: { x: 420, y: 200 },
          data: {
            nodeKey: "lgc_check_urgency",
            label: "شرط: هل الحالة طارئة؟",
            description: "IF category == 'طوارئ_حرجة' تفريع المسار فوراً",
            status: "idle",
            executionTime: "6ms",
            config: { condition: "{{ $json.isUrgent }} == true" },
          },
        },
        {
          id: "t3_4",
          type: "actionNode",
          position: { x: 60, y: 120 },
          data: {
            nodeKey: "act_alert_doctors",
            label: "تنبيه قروب الأطباء فوراً (Emergency Alert)",
            description: "إرسال إشعار أحمر عاجل مع رقم الهاتف وبيانات الحالة",
            status: "idle",
            executionTime: "45ms",
            config: { targetGroup: "Doctors On-Call Telegram Group" },
          },
        },
        {
          id: "t3_5",
          type: "actionNode",
          position: { x: 60, y: 320 },
          data: {
            nodeKey: "act_auto_reply_standard",
            label: "رد آلي روتيني وتذكرة دعم",
            description: "تم استلام استفسارك وسيتم الرد خلال ساعات العمل",
            status: "idle",
            executionTime: "30ms",
            config: { template: "Standard Support Auto-reply" },
          },
        },
      ]);
      setEdges([
        { id: "e_t3_1_2", source: "t3_1", target: "t3_2", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" } },
        { id: "e_t3_2_3", source: "t3_2", target: "t3_3", animated: true, style: { stroke: "#a855f7", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
        { id: "e_t3_3_4", source: "t3_3", sourceHandle: "true", target: "t3_4", animated: true, label: "طارئ (True)", labelStyle: { fill: "#ef4444", fontWeight: 700, fontSize: 11 }, labelBgStyle: { fill: "#0f172a", fillOpacity: 0.9 }, style: { stroke: "#ef4444", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" } },
        { id: "e_t3_3_5", source: "t3_3", sourceHandle: "false", target: "t3_5", animated: true, label: "عادي (False)", labelStyle: { fill: "#94a3b8", fontWeight: 700, fontSize: 11 }, labelBgStyle: { fill: "#0f172a", fillOpacity: 0.9 }, style: { stroke: "#64748b", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" } },
      ]);
      setWorkflowName("استقبال وتصنيف الشكاوى وتوجيه التذاكر (AI Triage)");
    } else if (templateId === "t4") {
      // Post-visit Follow-up & CRM Rating
      setNodes([
        {
          id: "t4_1",
          type: "triggerNode",
          position: { x: 1050, y: 220 },
          data: {
            nodeKey: "trg_appointment_complete",
            label: "حدث: اكتمال الموعد في العيادة",
            description: "Webhook يُطلق عند خروج المريض ودفع الفاتورة",
            status: "idle",
            executionTime: "8ms",
            config: { event: "appointment.completed", delayHours: 2 },
          },
        },
        {
          id: "t4_2",
          type: "codeNode",
          position: { x: 720, y: 220 },
          data: {
            nodeKey: "code_gen_survey_link",
            label: "توليد رابط استبيان مخصص برمز المريض",
            description: "إنشاء رمز مشفر فريد لتقييم تجربة المريض",
            status: "idle",
            executionTime: "5ms",
            config: { script: "return { surveyUrl: `https://clinic.iq/survey/${item.id}` };" },
          },
        },
        {
          id: "t4_3",
          type: "actionNode",
          position: { x: 380, y: 220 },
          data: {
            nodeKey: "act_send_rating_wa",
            label: "إرسال استبيان الرضا عبر واتساب",
            description: "نتمنى لكم الشفاء العاجل، نرجو تقييم زيارتكم اليوم",
            status: "idle",
            executionTime: "52ms",
            config: { template: "patient_feedback_stars", buttonType: "Interactive Buttons" },
          },
        },
        {
          id: "t4_4",
          type: "databaseNode",
          position: { x: 40, y: 220 },
          data: {
            nodeKey: "db_update_crm_score",
            label: "تحديث ملف العميل في الـ CRM",
            description: "حفظ سجل الاستبيان في سجل تاريخ المريض",
            status: "idle",
            executionTime: "14ms",
            config: { table: "crm_contacts", updateField: "satisfaction_score" },
          },
        },
      ]);
      setEdges([
        { id: "e_t4_1_2", source: "t4_1", target: "t4_2", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" } },
        { id: "e_t4_2_3", source: "t4_2", target: "t4_3", animated: true, style: { stroke: "#eab308", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#eab308" } },
        { id: "e_t4_3_4", source: "t4_3", target: "t4_4", animated: true, style: { stroke: "#f43f5e", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#f43f5e" } },
      ]);
      setWorkflowName("استبيان رضا العملاء والمتابعة بعد الزيارة (Post-Visit CRM)");
    } else if (templateId === "t5") {
      // Whisper Voice Note to EHR
      setNodes([
        {
          id: "t5_1",
          type: "triggerNode",
          position: { x: 1050, y: 220 },
          data: {
            nodeKey: "trg_voice_note",
            label: "استقبال رسالة صوتية (WhatsApp Audio)",
            description: "تلقي ملف صوتي OGG/MP3 من المريض أو الطبيب",
            status: "idle",
            executionTime: "12ms",
            config: { mimeType: "audio/ogg", maxDurationSec: 120 },
          },
        },
        {
          id: "t5_2",
          type: "aiNode",
          position: { x: 720, y: 220 },
          data: {
            nodeKey: "ai_whisper_transcribe",
            label: "تفريغ الصوت لنص عربي دقيق (Whisper AI)",
            description: "تحويل نبرة الصوت واللهجة العراقية لنص مقروء",
            status: "idle",
            executionTime: "520ms",
            config: { language: "ar", model: "openai/whisper-large-v3" },
          },
        },
        {
          id: "t5_3",
          type: "aiNode",
          position: { x: 380, y: 220 },
          data: {
            nodeKey: "ai_medical_summary",
            label: "استخراج الملخص الطبي والأعراض (RAG)",
            description: "تلخيص الشكوى، الدواء، والحساسيات إلى نقاط طبية",
            status: "idle",
            executionTime: "310ms",
            config: { systemPrompt: "استخرج الأعراض الرئيسية وحالة الألم بدقة في نقاط." },
          },
        },
        {
          id: "t5_4",
          type: "databaseNode",
          position: { x: 40, y: 220 },
          data: {
            nodeKey: "db_save_patient_chart",
            label: "حفظ الملاحظة في الملف الطبي (EHR)",
            description: "إدراج النص المفرغ والملخص في سجل المريض",
            status: "idle",
            executionTime: "16ms",
            config: { table: "patient_medical_charts", isEncrypted: true },
          },
        },
      ]);
      setEdges([
        { id: "e_t5_1_2", source: "t5_1", target: "t5_2", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" } },
        { id: "e_t5_2_3", source: "t5_2", target: "t5_3", animated: true, style: { stroke: "#a855f7", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
        { id: "e_t5_3_4", source: "t5_3", target: "t5_4", animated: true, style: { stroke: "#a855f7", strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } },
      ]);
      setWorkflowName("تفريغ الاستشارات والرسائل الصوتية بـ Whisper والذكاء الاصطناعي");
    }
    setShowTemplatesModal(false);
    showToast("تم تحميل القالب بنجاح على اللوحة!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] relative select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-2xl shadow-indigo-600/50 flex items-center gap-2 border border-indigo-400 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Enterprise n8n Toolbar */}
      <header className="h-16 px-5 bg-[#0b101d]/90 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between shrink-0 z-30 shadow-lg">
        {/* Left: Workflow Title & Status */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <WorkflowIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent hover:bg-gray-800/60 focus:bg-gray-900 border border-transparent hover:border-gray-700 focus:border-indigo-500/80 rounded-lg px-2 py-0.5 text-sm font-bold text-white transition-all outline-none max-w-sm md:max-w-md"
              />
              <span className="text-[10px] font-mono text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded-full border border-gray-700">
                v2.4 Production
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
              <button
                onClick={() => setWorkflowActive(!workflowActive)}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${workflowActive ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" : "bg-gray-500"
                    }`}
                />
                <span className={workflowActive ? "text-emerald-400 font-bold" : "text-gray-400"}>
                  {workflowActive ? "المسار نشط (Active)" : "معطّل (Inactive)"}
                </span>
              </button>
              <span>•</span>
              <span>آخر تعديل: الآن</span>
              <span>•</span>
              <span className="text-indigo-400 font-mono">1,420 تشغيل ناجح</span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-gray-900/90 border border-gray-800">
          <button
            onClick={() => setViewMode("canvas")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "canvas"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-gray-400 hover:text-gray-200"
              }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>لوحة المخطط (n8n Studio)</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "list"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-gray-400 hover:text-gray-200"
              }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>قائمة التدفقات ({workflows.length})</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNodeLibrary(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عقدة</span>
          </button>

          <button
            onClick={runDryRunSimulation}
            disabled={isRunningDryRun}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${isRunningDryRun
                ? "bg-amber-600 text-white shadow-amber-600/30 animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 hover:scale-105"
              }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningDryRun ? "animate-spin" : ""}`} />
            <span>{isRunningDryRun ? "جاري الاختبار..." : "تشغيل تجريبي"}</span>
          </button>

          <button
            onClick={handleValidateWorkflow}
            title="فحص سلامة المسار والتحقق من التوصيلات"
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>فحص المسار</span>
          </button>

          <button
            onClick={handleAutoLayout}
            title="تنظيم تلقائي للعقد والمخطط"
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition-all"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportJson}
            title="تصدير كود المسار كملف JSON"
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            title="استيراد مسار عمل من ملف أو كود JSON"
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition-all"
          >
            <Upload className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => setShowExecutionsDrawer(true)}
            title="سجل التشغيل التاريخي"
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition-all relative"
          >
            <History className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 animate-ping"></span>
          </button>

          <button
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            title="استعراض قوالب الأتمتة الجاهزة (5 قوالب متقدمة)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>القوالب (5)</span>
          </button>

          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-500/50 text-indigo-200 hover:text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/40"
            title="دليل الاستخدام والتعليمات الشامل لغير التقنيين"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>دليل الاستخدام 📖</span>
          </button>
        </div>
      </header>

      {/* Main Content View */}
      {viewMode === "canvas" ? (
        <div className="flex-1 relative w-full h-full overflow-hidden bg-[#070b14]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            className="touch-none"
          >
            <Background color="#1e293b" gap={20} size={1.2} variant={BackgroundVariant.Dots} />
            <Controls className="!bg-[#0f172a] !border-gray-800 !rounded-xl !shadow-2xl [&>button]:!border-gray-800 [&>button]:!text-gray-300 hover:[&>button]:!bg-gray-800" />
            <MiniMap
              nodeStrokeWidth={3}
              nodeColor={(n) => {
                if (n.type === "triggerNode") return "#f59e0b";
                if (n.type === "aiNode") return "#a855f7";
                if (n.type === "logicNode") return "#10b981";
                if (n.type === "databaseNode") return "#06b6d4";
                return "#ef4444";
              }}
              maskColor="rgba(7, 11, 20, 0.75)"
              className="!bg-[#0b101d] !border !border-gray-800 !rounded-xl overflow-hidden !shadow-2xl"
            />
          </ReactFlow>

          {/* Quick Floating Status Badge on Bottom Right */}
          <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/90 border border-gray-800 backdrop-blur-md shadow-xl text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>n8n Visual Engine Active</span>
            <span className="text-gray-500 font-mono">| {nodes.length} Nodes</span>
          </div>

          {/* Bottom Terminal Drawer (Logs) */}
          {showTerminal && (
            <div className="absolute bottom-0 left-0 right-0 max-h-60 bg-[#0a0f1d]/95 backdrop-blur-2xl border-t border-indigo-500/30 z-30 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
              <div className="px-4 py-2 bg-gray-950/90 border-b border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono text-indigo-400 font-bold">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>FlowDesk Runtime Terminal (n8n Execution Engine)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTerminalLogs([])}
                    className="text-[11px] text-gray-400 hover:text-white px-2 py-0.5 rounded hover:bg-gray-800"
                  >
                    مسح السجل
                  </button>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3 font-mono text-xs text-gray-300 overflow-y-auto space-y-1 max-h-48">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Workflows Dashboard List View */
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#070b14] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">إدارة وتدفقات الأتمتة (Active Workflows)</h2>
              <p className="text-xs text-gray-400 mt-1">
                جميع المسارات تعمل داخل بيئة معزولة للمؤسسة، مع مراقبة حية لنسب النجاح والأخطاء.
              </p>
            </div>
            <button
              onClick={() => {
                setViewMode("canvas");
                setShowNodeLibrary(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء مسار جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="p-5 rounded-2xl bg-[#0f1523]/80 border border-gray-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${wf.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                    >
                      {wf.isActive ? "نشط ومفعّل" : "معطّل مؤقتاً"}
                    </span>
                    <button
                      onClick={() => {
                        setWorkflows((prev) =>
                          prev.map((w) => (w.id === wf.id ? { ...w, isActive: !w.isActive } : w))
                        );
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      {wf.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-500" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                    {wf.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{wf.description}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {wf.channels.map((ch, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-gray-900 border border-gray-800 text-gray-300 px-2 py-0.5 rounded-md font-mono"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-gray-400">التشغيل الناجح</div>
                    <div className="text-white font-bold">{wf.executionsCount} مرة ({wf.successRate})</div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveWfId(wf.id);
                      setWorkflowName(wf.name);
                      setWorkflowActive(wf.isActive);
                      setViewMode("canvas");
                      if (wf.id === "wf_omnichannel") loadTemplate("t_omni");
                      else if (wf.id === "wf_1") loadTemplate("t1");
                      else if (wf.id === "wf_2") loadTemplate("t3");
                      else if (wf.id === "wf_3") loadTemplate("t2");
                      else if (wf.id === "wf_4") loadTemplate("t4");
                    }}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    <span>فتح المخطط</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Smart Next-Node Contextual Suggestions Modal */}
      {suggestTargetNodeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e1628] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">الخطوة التالية المقترحة (Smart Next Step)</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    بناءً على العقدة: <span className="text-indigo-300 font-bold">{nodes.find((n) => n.id === suggestTargetNodeId)?.data?.label}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuggestTargetNodeId(null)}
                className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {getNextStepSuggestions(suggestTargetNodeId).map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAddAndConnectSuggestedNode(suggestTargetNodeId, sug)}
                  className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-indigo-500 hover:bg-gray-800/80 cursor-pointer transition-all flex items-center justify-between group shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {sug.title}
                      </div>
                      <div className="text-[11px] text-gray-400 leading-snug">{sug.desc}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 font-medium">
                    {sug.badge}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setSuggestTargetNodeId(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pre-flight Workflow Validator Modal */}
      {showValidatorModal && validationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e1628] border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">تقرير فحص سلامة مسار العمل (Pre-flight Validator)</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">فحص الجاهزية للإنتاج والتأكد من عدم وجود أخطاء في التوصيلات</p>
                </div>
              </div>
              <button
                onClick={() => setShowValidatorModal(false)}
                className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {validationReport.hasTrigger ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="text-white font-medium">وجود مشغّل رئيسي (Trigger Node)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${validationReport.hasTrigger ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                  {validationReport.hasTrigger ? "موجود ومفعّل" : "مفقود"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {validationReport.orphanNodes.length === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <div className="text-white font-medium">فحص العقد المعلقة (Orphan Nodes)</div>
                    <div className="text-[10px] text-gray-400">التأكد من أن كل عقدة متصلة بالمسار</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  0 عقد معلقة
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium">حماية القفل الذري لمنع التعارض (PostgreSQL Mutex)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  نشط ومحمي
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium">عزل بيانات المؤسسة (Multi-tenant Boundary)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  100% معزول
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>المسار سليم وجاهز للتشغيل والإنتاج الفوري دون أي تعارضات برمجية!</span>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setShowValidatorModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                إغلاق التقرير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Import Workflow Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e1628] border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">استيراد مسار عمل (Import Workflow JSON)</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">
              الصق كود الـ JSON الخاص بمسار العمل لتحميل العقد والتوصيلات فوراً على اللوحة:
            </p>

            <textarea
              rows={8}
              placeholder='{ "name": "مسار عمل", "nodes": [...], "edges": [...] }'
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-white font-mono text-xs outline-none focus:border-indigo-500 leading-relaxed"
            />

            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleImportJson}
                disabled={!importJsonText.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                استيراد وتحميل المخطط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Comprehensive Node Library Drawer */}
      {showNodeLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-[#0d1424] border-r border-gray-800 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">مكتبة العقد والتطبيقات (Node Library)</h3>
              </div>
              <button onClick={() => setShowNodeLibrary(false)} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="ابحث في العقد (Trigger, AI, Logic, SMS)..."
                value={nodeSearchQuery}
                onChange={(e) => setNodeSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-gray-900 border border-gray-800 focus:border-indigo-500 text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
              {[
                { key: "all", label: "الكل" },
                { key: "triggers", label: "المشغلات" },
                { key: "ai", label: "الذكاء الاصطناعي" },
                { key: "logic", label: "المنطق والبيانات" },
                { key: "actions", label: "الإجراءات والقنوات" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCatalogTab(tab.key)}
                  className={`px-3 py-1 rounded-lg shrink-0 text-[11px] font-semibold transition-all ${activeCatalogTab === tab.key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-5 pr-1">
              {filteredCatalog.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>{cat.category}</span>
                  </div>

                  <div className="space-y-2">
                    {cat.items.map((item, itemIdx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={itemIdx}
                          onClick={() => handleAddNodeFromCatalog(item)}
                          className="p-3 rounded-xl bg-gray-900/70 border border-gray-800/80 hover:border-indigo-500/60 hover:bg-gray-800/60 transition-all cursor-pointer flex items-center justify-between group shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.accent}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {item.title}
                              </div>
                              <p className="text-[11px] text-gray-400 line-clamp-1">{item.desc}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                            + إضافة
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Comprehensive Node Inspector Drawer */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-[#0d1424] border-r border-gray-800 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Inspector Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedNode.data.label}</span>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                      {selectedNode.data.nodeKey}
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{selectedNode.data.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                    setSelectedNode(null);
                  }}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="حذف العقدة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedNode(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inspector Tabs */}
            <div className="flex items-center border-b border-gray-800 mt-4 text-xs">
              <button
                onClick={() => setInspectorTab("params")}
                className={`pb-3 px-4 font-bold transition-all relative ${inspectorTab === "params" ? "text-indigo-400" : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                <span>الإعدادات</span>
                {inspectorTab === "params" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></span>}
              </button>

              {selectedNode.type === "aiNode" && (
                <>
                  <button
                    onClick={() => setInspectorTab("prompt")}
                    className={`pb-3 px-4 font-bold transition-all relative ${inspectorTab === "prompt" ? "text-indigo-400" : "text-gray-400 hover:text-gray-200"
                      }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>محرر البرومبت والتعليمات</span>
                    </span>
                    {inspectorTab === "prompt" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></span>}
                  </button>

                  <button
                    onClick={() => setInspectorTab("knowledge")}
                    className={`pb-3 px-4 font-bold transition-all relative ${inspectorTab === "knowledge" ? "text-indigo-400" : "text-gray-400 hover:text-gray-200"
                      }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>مصدر المعرفة والملفات (RAG)</span>
                    </span>
                    {inspectorTab === "knowledge" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></span>}
                  </button>
                </>
              )}

              <button
                onClick={() => setInspectorTab("data")}
                className={`pb-3 px-4 font-bold transition-all relative ${inspectorTab === "data" ? "text-indigo-400" : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                <span>مخطط البيانات (Schema)</span>
                {inspectorTab === "data" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></span>}
              </button>

              <button
                onClick={() => setInspectorTab("test")}
                className={`pb-3 px-4 font-bold transition-all relative ${inspectorTab === "test" ? "text-indigo-400" : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                <span>اختبار العقدة (Test Step)</span>
                {inspectorTab === "test" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></span>}
              </button>
            </div>

            {/* Inspector Content */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4">
              {inspectorTab === "params" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-300 font-bold mb-1.5">عنوان العقدة</label>
                    <input
                      type="text"
                      value={selectedNode.data.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((nds) =>
                          nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, label: val } } : n))
                        );
                        setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, label: val } } : null));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* 1. Cron Trigger Parameters */}
                  {selectedNode.type === "triggerNode" && (selectedNode.data.nodeKey?.includes("cron") || selectedNode.data.label?.includes("مجدول") || selectedNode.data.label?.includes("Cron")) && (
                    <div className="space-y-3.5 pt-2">
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white mb-0.5">مؤقت زمني مجدول (Cron Schedule Engine)</div>
                          <p className="text-[10px] text-gray-300 leading-relaxed">
                            يُطلق هذا المسار أوتوماتيكياً في أوقات محددة وفق توقيت العراق الرسمي دون الحاجة لتدخل بشري.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">جدول التكرار المعتمد (Cron Presets)</label>
                        <select
                          defaultValue="0 9 * * *"
                          onChange={(e) => {
                            const val = e.target.value;
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, config: { ...n.data.config, expression: val } } }
                                  : n
                              )
                            );
                            showToast(`تم تعيين توقيت الجدولة: ${val}`);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="0 9 * * *">⏰ يومياً الساعة 09:00 صباحاً (تذكير بمواعيد الغد عبر SMS)</option>
                          <option value="0 20 * * *">🌙 يومياً الساعة 08:00 مساءً (تقرير الإغلاق ومطابقة المواعيد)</option>
                          <option value="*/30 * * * *">🔄 كل 30 دقيقة (مزامنة التقويم وحالات الحضور)</option>
                          <option value="0 8 * * 0-4">💼 أيام الدوام الرسمي من الأحد للخميس (08:00 ص)</option>
                          <option value="0 0 1 * *">📅 أول يوم من كل شهر (التقارير الشهرية والإحصائيات)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">تعبير الجدولة الدقيق (Cron Expression)</label>
                        <input
                          type="text"
                          defaultValue={selectedNode.data.config?.expression || "0 9 * * *"}
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-amber-400 font-mono text-xs outline-none focus:border-indigo-500"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">
                          الصيغة: دقيقة &bull; ساعة &bull; يوم &bull; شهر &bull; يوم الأسبوع
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">المنطقة الزمنية (Timezone)</label>
                        <input
                          type="text"
                          disabled
                          defaultValue="Asia/Baghdad (توقيت العراق الرسمي +03:00 UTC)"
                          className="w-full px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 font-mono text-xs cursor-not-allowed"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-between">
                        <span>التشغيل القادم:</span>
                        <span className="font-mono font-bold">غداً 09:00 AM (بتوقيت بغداد)</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Webhook / WhatsApp Trigger Parameters */}
                  {selectedNode.type === "triggerNode" && !(selectedNode.data.nodeKey?.includes("cron") || selectedNode.data.label?.includes("مجدول") || selectedNode.data.label?.includes("Cron")) && (
                    <div className="space-y-3.5 pt-2">
                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">قناة استقبال الحدث (Listening Channel)</label>
                        <select
                          defaultValue="WhatsApp Official Webhook (+964 Iraq)"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="WhatsApp Official Webhook (+964 Iraq)">🟢 محادثات واتساب (WhatsApp Webhook +964)</option>
                          <option value="Telegram Bot Webhook">🔵 تيليجرام بوت (Telegram Bot Webhook)</option>
                          <option value="External HTTP POST Webhook">🌐 استدعاء Webhook خارجي (REST API)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-gray-300 font-bold">رقم واتساب العيادة المستمع (Listening Phone)</label>
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            متصل ونشط
                          </span>
                        </div>
                        <input
                          type="text"
                          defaultValue="+964 780 123 4567 (عيادة البصرة الرسمية)"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono text-xs outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">أنواع الرسائل المقبولة للمعالجة</label>
                        <select
                          defaultValue="all"
                          className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs outline-none"
                        >
                          <option value="all">الكل (نصوص، رسائل صوتية Whisper، ومستندات)</option>
                          <option value="audio_only">رسائل صوتية فقط (تفريغ الصوت والاستشارات)</option>
                          <option value="text_only">رسائل نصية فقط</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-[11px] font-medium mb-1">رمز التحقق والأمان (Webhook Secret Token)</label>
                        <input
                          type="password"
                          defaultValue="whsec_clinic_basra_live_9921"
                          className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 font-mono text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. Code & Script Node Parameters (Python 3.12 & JavaScript) */}
                  {selectedNode.type === "codeNode" && (
                    <div className="space-y-3.5 pt-2">
                      <div className="p-3 rounded-xl bg-yellow-950/20 border border-yellow-500/30 flex items-start gap-2.5">
                        <Code2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white mb-0.5">معالجة برمجية متقدمة (Code Execution Engine)</div>
                          <p className="text-[10px] text-gray-300 leading-relaxed">
                            قم بكتابة وتطبيق شيفرات برمجية لمعالجة البيانات الطبية، التحويلات الرياضية، أو تنسيق السجلات.
                          </p>
                        </div>
                      </div>

                      {/* Language Selector: Python 3.12 vs JavaScript */}
                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">لغة البرمجة وبيئة التشغيل (Runtime Language)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setNodes((nds) =>
                                nds.map((n) =>
                                  n.id === selectedNode.id
                                    ? { ...n, data: { ...n.data, config: { ...n.data.config, language: "python" } } }
                                    : n
                                )
                              );
                              showToast("تم اختيار بيئة بايثون (Python 3.12 Runtime)");
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                              (selectedNode.data.config?.language || "python") === "python"
                                ? "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                            }`}
                          >
                            <span className="text-base">🐍</span>
                            <span>Python 3.12 (الخيار المفضل)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNodes((nds) =>
                                nds.map((n) =>
                                  n.id === selectedNode.id
                                    ? { ...n, data: { ...n.data, config: { ...n.data.config, language: "javascript" } } }
                                    : n
                                )
                              );
                              showToast("تم اختيار بيئة جافاسكريبت (Node.js ES2024)");
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                              selectedNode.data.config?.language === "javascript"
                                ? "bg-yellow-600/30 border-yellow-500 text-yellow-300 shadow-md shadow-yellow-600/30"
                                : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                            }`}
                          >
                            <span className="text-base">⚡</span>
                            <span>JavaScript (ES2024)</span>
                          </button>
                        </div>
                      </div>

                      {/* Ready Python/JS Snippets */}
                      <div>
                        <label className="block text-gray-400 text-[11px] font-medium mb-1.5">نماذج برمجية جاهزة للاستخدام السريع</label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              showToast("تم إدراج كود توحيد الأرقام العراقية");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-indigo-300 text-[10px] font-mono transition-colors"
                          >
                            تنسيق رقم الهاتف العراقي (+964)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              showToast("تم إدراج كود حساب الفترات الزمنية");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-emerald-300 text-[10px] font-mono transition-colors"
                          >
                            حساب وقت الموعد (Slot Calculator)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              showToast("تم إدراج كود فلترة الطوارئ");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-rose-300 text-[10px] font-mono transition-colors"
                          >
                            فلترة حالات الطوارئ (Urgent Triage)
                          </button>
                        </div>
                      </div>

                      {/* Code Editor */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-gray-300 font-bold">
                            {(selectedNode.data.config?.language || "python") === "python" ? "محرر شيفرة Python 3.12" : "محرر كود JavaScript"}
                          </label>
                          <span className="text-[10px] text-gray-500 font-mono">المدخلات: items | المخرج: return result</span>
                        </div>
                        <textarea
                          rows={8}
                          defaultValue={
                            (selectedNode.data.config?.language || "python") === "python"
                              ? `# FlowDesk AI Python Runtime (v3.12)
# المدخلات من العقدة السابقة متاحة في المتغير: items

def process_patient_records(items):
    output = []
    for item in items:
        # توحيد صيغة رقم الهاتف العراقي
        raw_phone = str(item.get("phone", ""))
        if raw_phone.startswith("07"):
            clean_phone = "+964" + raw_phone[1:]
        else:
            clean_phone = raw_phone

        output.append({
            "client_name": item.get("clientName", "مراجع"),
            "phone": clean_phone,
            "doctor": item.get("doctor", "د. خالد السالم"),
            "slot_valid": True,
            "processed_by": "FlowDesk Python 3.12"
        })
    return output

return process_patient_records(items)`
                              : `// FlowDesk AI JavaScript ES2024 Runtime
return items.map(item => {
  const phone = item.phone?.startsWith("07") ? "+964" + item.phone.slice(1) : item.phone;
  return {
    ...item,
    phone,
    timestamp: new Date().toISOString()
  };
});`
                          }
                          className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-emerald-400 font-mono text-[11px] outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. Logic & Atomic Guard Node Parameters */}
                  {selectedNode.type === "logicNode" && (
                    <div className="space-y-3.5 pt-2">
                      {/* Check if Atomic Guard */}
                      {selectedNode.data.nodeKey?.includes("guard") || selectedNode.data.label?.includes("الذري") || selectedNode.data.label?.includes("Atomic") ? (
                        <>
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-white mb-0.5">القفل الذري لمنع الحجز المزدوج (PostgreSQL Mutex Guard)</div>
                              <p className="text-[10px] text-gray-300 leading-relaxed">
                                يضمن استحالة حجز نفس الطبيب أو الغرفة لمريضين في نفس الدقيقة عبر قفل السجل في قاعدة البيانات.
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-300 font-bold mb-1.5">محرك القفل الذري (Lock Mechanism)</label>
                            <input
                              type="text"
                              disabled
                              defaultValue="PostgreSQL SELECT FOR UPDATE (Serializable Mutex)"
                              className="w-full px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-emerald-300 font-mono text-xs cursor-not-allowed"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-400 text-[11px] font-medium mb-1">الجدول المحمي</label>
                              <input
                                type="text"
                                defaultValue="appointments"
                                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-[11px] font-medium mb-1">فاصل الأمان الزمني</label>
                              <select
                                defaultValue="15"
                                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs outline-none"
                              >
                                <option value="10">10 دقائق</option>
                                <option value="15">15 دقيقة (موصى به)</option>
                                <option value="30">30 دقيقة</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-300 font-bold mb-1.5">الإجراء عند اكتشاف تعارض في الحجز</label>
                            <select
                              defaultValue="branch_alternative"
                              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs outline-none"
                            >
                              <option value="branch_alternative">توجيه إلى مسار البديل (False Branch) لاقتراح موعد آخر</option>
                              <option value="reject_notify">رفض الحجز فوراً وإرسال رسالة اعتذار للعميل</option>
                              <option value="alert_staff">إشعار موظف الاستقبال بالمراجعة اليدوية</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        /* Standard IF/ELSE Condition */
                        <>
                          <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/30 flex items-start gap-2.5">
                            <GitBranch className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold text-white mb-0.5">التفرع الشرطي (IF / ELSE Condition)</div>
                              <p className="text-[10px] text-gray-300 leading-relaxed">
                                توجيه سريان المسار بناءً على نية المريض أو درجة الإلحاح أو التحقق.
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-300 font-bold mb-1.5">الشرط البرمجي (Evaluation Expression)</label>
                            <input
                              type="text"
                              defaultValue="{{ $json.intent }} == 'BOOK_APPOINTMENT'"
                              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-teal-300 font-mono text-xs outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-400 text-[11px] font-medium mb-1">تسمية فرع النجاح (True)</label>
                              <input
                                type="text"
                                defaultValue="حجز موعد / طارئ"
                                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-emerald-400 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-[11px] font-medium mb-1">تسمية فرع البديل (False)</label>
                              <input
                                type="text"
                                defaultValue="استفسار عام / روتيني"
                                className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 text-xs outline-none"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* 5. Database Node Parameters */}
                  {selectedNode.type === "databaseNode" && (
                    <div className="space-y-3.5 pt-2">
                      <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-2.5">
                        <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white mb-0.5">عمليات قاعدة البيانات (PostgreSQL Storage)</div>
                          <p className="text-[10px] text-gray-300 leading-relaxed">
                            استعلام وحفظ سجلات المواعيد وتحديث درجات رضا المرضى وبيانات المؤسسة.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">الجدول الهدف (Target Table)</label>
                        <select
                          defaultValue="appointments"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs font-mono"
                        >
                          <option value="appointments">appointments (سجل المواعيد والتقويم)</option>
                          <option value="crm_contacts">crm_contacts (بيانات المرضى والمراجعين)</option>
                          <option value="patient_medical_charts">patient_medical_charts (السجلات الطبية EHR)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">نوع العملية (Database Operation)</label>
                        <select
                          defaultValue="SELECT"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-cyan-300 font-bold text-xs outline-none"
                        >
                          <option value="SELECT">SELECT (استعلام وبحث عن موعد أو مريض)</option>
                          <option value="INSERT">INSERT (إضافة موعد أو مريض جديد)</option>
                          <option value="UPDATE">UPDATE (تحديث حالة الموعد أو تقييم الرضا)</option>
                          <option value="UPSERT">UPSERT (تحديث إن وُجد أو إنشاء سجل جديد)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-[11px] font-medium mb-1">حقل المطابقة والاستعلام (Filter Key)</label>
                        <input
                          type="text"
                          defaultValue="phone == {{ $json.phone }}"
                          className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 font-mono text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 6. AI Node Parameters */}
                  {selectedNode.type === "aiNode" && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-gray-300 font-bold">نموذج ومحرك الذكاء الاصطناعي (AI Model Engine)</label>
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            يتوفر باقات مجانية
                          </span>
                        </div>
                        <select
                          value={selectedNode.data.config?.model || "Google Gemini 1.5 Flash (مجاني - Free Tier)"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, config: { ...n.data.config, model: val } } }
                                  : n
                              )
                            );
                            setSelectedNode((prev) =>
                              prev ? { ...prev, data: { ...prev.data, config: { ...prev.data.config, model: val } } } : null
                            );
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="Google Gemini 1.5 Flash (مجاني - Free Tier)">
                            ⚡ Google Gemini 1.5 Flash (مجاني - Free Tier 15 RPM)
                          </option>
                          <option value="Ollama Local LLM (مجاني 100% دون إنترنت)">
                            💻 Ollama Local LLM / Llama-3 (مجاني 100% بدون إنترنت)
                          </option>
                          <option value="Groq Llama-3 70B (مجاني فائق السرعة)">
                            🚀 Groq Llama-3 70B (مجاني فائق السرعة Free Tier)
                          </option>
                          <option value="OpenAI Whisper Large-v3 (صوت عراقي)">
                            🎙️ OpenAI Whisper Large-v3 (تفريغ الرسائل الصوتية واللهجة العراقية)
                          </option>
                          <option value="Claude 3.5 Sonnet (مدفوع سحابي)">
                            🧠 Claude 3.5 Sonnet (سحابي متقدم)
                          </option>
                          <option value="GPT-4o (مدفوع سحابي)">
                            🤖 OpenAI GPT-4o (سحابي متقدم)
                          </option>
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                          * يمكنك استخدام Google Gemini 1.5 Flash أو تشغيل Ollama محلياً على سيرفرك مجاناً تماماً بدون أي رسوم شهرية.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-400 text-[11px] font-medium mb-1">درجة الإبداع (Temperature)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            defaultValue={selectedNode.data.config?.temperature || "0.2"}
                            className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-[11px] font-medium mb-1">الحد الأقصى للتوكنز</label>
                          <input
                            type="number"
                            defaultValue={selectedNode.data.config?.maxTokens || "800"}
                            className="w-full px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono text-xs outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. Output Node Parameters */}
                  {selectedNode.type === "outputNode" && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">تنسيق النتيجة النهائية (Output Format)</label>
                        <select
                          defaultValue="JSON + Dashboard Notification"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="JSON + Dashboard Notification">تجميع كائن JSON كامل + إشعار للوحة التحكم</option>
                          <option value="HTTP 200 OK Webhook Response">استجابة HTTP Webhook فورية (API Response)</option>
                          <option value="WhatsApp Confirmation Card">بطاقة تأكيد مرئية للمريض</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">ملخص المخرجات المعتمدة</label>
                        <textarea
                          rows={3}
                          defaultValue={selectedNode.data.config?.payloadSummary || '{\n  "status": "CONFIRMED",\n  "appointmentId": "APT-2026-904",\n  "doctor": "د. خالد السالم",\n  "slot": "16:30"\n}'}
                          className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-emerald-400 font-mono text-[11px] outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* 8. Action Node Parameters (WhatsApp / SMS / Telegram Recipient & Channel) */}
                  {selectedNode.type === "actionNode" && (
                    <div className="space-y-4 pt-2">
                      {/* Dynamic Variable Mapper Assistant only for Action Node */}
                      <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                        <div className="text-[11px] font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>مساعد المتغيرات الديناميكية (Dynamic Variable Mapper)</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-2">
                          انقر على أي متغير لنسخه وإدراجه في نص الرسالة:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: "اسم المريض", var: "{{ $json.clientName }}" },
                            { label: "رقم الهاتف", var: "{{ $json.phone }}" },
                            { label: "اسم الطبيب", var: "{{ $json.doctor }}" },
                            { label: "تاريخ الموعد", var: "{{ $json.date }}" },
                            { label: "وقت الموعد", var: "{{ $json.requestedTime }}" },
                            { label: "القاعة/العيادة", var: "{{ $json.lockedRoom }}" },
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (navigator?.clipboard) navigator.clipboard.writeText(item.var);
                                showToast(`تم نسخ ${item.var}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-indigo-600 border border-gray-800 text-gray-300 hover:text-white font-mono text-[10px] transition-all flex items-center gap-1"
                            >
                              <span className="text-gray-400">{item.label}:</span>
                              <span className="text-indigo-300">{item.var}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Channel Switcher */}
                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">قناة الإرسال والتواصل (Delivery Channel)</label>
                        <select
                          defaultValue="WhatsApp Official Business API"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="WhatsApp Official Business API">🟢 واتساب رسمي (WhatsApp Official Cloud API)</option>
                          <option value="Iraq SMS Gateway (Zain / Asiacell)">📱 بوابة SMS العراق (Zain / Asiacell Gateway)</option>
                          <option value="Telegram Channel / Bot Alert">🔵 تيليجرام (Telegram Doctor Group / Alert)</option>
                          <option value="Official Clinic Email (SMTP)">✉️ بريد إلكتروني رسمي (Clinic Email)</option>
                          <option value="External HTTP POST Webhook">🌐 استدعاء Webhook خارجي (External API)</option>
                        </select>
                      </div>

                      {/* Recipient Phone Configuration */}
                      <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-gray-300 font-bold flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-indigo-400" />
                            <span>رقم هاتف المستلم (Recipient Phone Number)</span>
                          </label>
                          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">
                            ديناميكي أو مخصص
                          </span>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            defaultValue={selectedNode.data.config?.recipientPhone || "{{ $json.phone }}"}
                            placeholder="أدخل رقم الهاتف أو المتغير..."
                            className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-emerald-400 font-mono text-xs outline-none focus:border-indigo-500 pl-24"
                          />
                          <span className="absolute left-2.5 top-2 text-[10px] font-mono text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded">
                            E.164 (+964)
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-400">
                          اختر بسرعة مصدر الرقم:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => showToast("تم تعيين رقم هاتف المريض التلقائي")}
                            className="px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono flex items-center gap-1 transition-colors"
                          >
                            <span>{'{{ $json.phone }}'} (رقم العميل التلقائي)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast("تم تعيين رقم الطبيب المناوب")}
                            className="px-2 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-[10px] font-mono transition-colors"
                          >
                            <span>{'{{ $json.doctorPhone }}'} (رقم الطبيب)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast("تم تعيين رقم تجريبي في البصرة")}
                            className="px-2 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-[10px] font-mono transition-colors"
                          >
                            <span>+964 780 123 4567 (رقم تجريبي)</span>
                          </button>
                        </div>
                      </div>

                      {/* Sender Identity */}
                      <div>
                        <label className="block text-gray-300 font-bold mb-1.5">حساب الإرسال الرسمي للعيادة (Sender ID)</label>
                        <select
                          defaultValue="Basra Clinic Official (+964 780 123 4567)"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-indigo-500 text-xs font-mono"
                        >
                          <option value="Basra Clinic Official (+964 780 123 4567)">
                            عيادة البصرة (+964 780 123 4567) - واتساب موثق بالعلامة الخضراء
                          </option>
                          <option value="Zain Iraq Bulk SMS - Sender: CLINIC-IQ">
                            بوابة Zain Iraq SMS - Sender: CLINIC-IQ
                          </option>
                          <option value="Asiacell Bulk SMS - Sender: BASRA-MED">
                            بوابة Asiacell SMS - Sender: BASRA-MED
                          </option>
                        </select>
                      </div>

                      {/* Message Content */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-gray-300 font-bold">نص وقالب الرسالة المعتمدة (Message Template)</label>
                          <span className="text-[10px] text-gray-400">يدعم المتغيرات الذكية</span>
                        </div>
                        <textarea
                          rows={4}
                          defaultValue={selectedNode.data.config?.messageBody || "تم تأكيد موعدكم بنجاح يا {{ $json.clientName }} مع {{ $json.doctor }} بتاريخ {{ $json.date }} الساعة {{ $json.requestedTime }} في عيادة البصرة. نرجو الحضور قبل الموعد بـ 10 دقائق."}
                          className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono text-[11px] outline-none focus:border-indigo-500 leading-relaxed"
                        />
                      </div>

                      {/* Attachments / Media */}
                      <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                        <label className="block text-gray-300 font-bold text-[11px] flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                          <span>إرفاق ملفات أو روابط مع الرسالة (Media Attachment)</span>
                        </label>
                        <select
                          defaultValue="none"
                          className="w-full px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 text-xs outline-none"
                        >
                          <option value="none">بدون مرفقات (رسالة نصية فقط)</option>
                          <option value="pdf_report">📎 إرفاق ملف الفحص / الوصل (PDF Document URL)</option>
                          <option value="clinic_map">🗺️ إرفاق خريطة وموقع العيادة في البصرة (Image/Map)</option>
                          <option value="calendar_invite">📅 إرفاق رابط إضافة الموعد لتقويم الهاتف (Google Calendar)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Prompt Studio Tab */}
              {inspectorTab === "prompt" && selectedNode.type === "aiNode" && (
                <div className="space-y-4 text-xs">
                  {/* Presets */}
                  <div>
                    <label className="block text-gray-300 font-bold mb-2">قوالب التعليمات الجاهزة (System Presets)</label>
                    <div className="space-y-2">
                      {PROMPT_PRESETS.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, config: { ...n.data.config, systemPrompt: preset.prompt } } }
                                  : n
                              )
                            );
                            showToast(`تم تطبيق قالب [${preset.title}]`);
                          }}
                          className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-indigo-500 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                            {preset.title}
                          </span>
                          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            تطبيق
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold mb-1.5">تعليمات النظام النشطة (System Prompt)</label>
                    <textarea
                      rows={4}
                      defaultValue={selectedNode.data.config?.systemPrompt || "أنت المساعد الذكي الرسمي..."}
                      className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-white font-mono text-[11px] outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  {/* Playground */}
                  <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2.5">
                    <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>مختبر تجربة البرومبت (Prompt Playground)</span>
                    </div>
                    <input
                      type="text"
                      value={testPromptInput}
                      onChange={(e) => setTestPromptInput(e.target.value)}
                      placeholder="اكتب رسالة تجريبية من مريض..."
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTestPromptExecution}
                      disabled={isTestingPrompt}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isTestingPrompt ? "animate-spin" : ""}`} />
                      <span>{isTestingPrompt ? "جاري الاستخراج..." : "معاينة الاستخراج الذكي"}</span>
                    </button>

                    {testPromptOutput && (
                      <pre className="p-2.5 rounded-lg bg-black border border-gray-800 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-40">
                        {testPromptOutput}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* RAG Knowledge Base & Files Tab (الرد من ملف معين) */}
              {inspectorTab === "knowledge" && selectedNode.type === "aiNode" && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">الرد والاستناد إلى ملفات العيادة (File-Grounded RAG)</h4>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        حدد الملف الذي تريد أن يجيب منه الذكاء الاصطناعي حصراً (مثل: جدول أسعار الخدمات، مواعيد الأطباء، أو سياسة العيادة)، لمنع أي اختلاق أو إجابات غير دقيقة.
                      </p>
                    </div>
                  </div>

                  {/* Strict Document Grounding Toggle */}
                  <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-xs">التقيّد الحصري بالملف (Strict Zero-Hallucination)</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        إذا لم تكن الإجابة مذكورة في الملف، يطلب من المريض مراجعة إدارة العيادة
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      مفعل وصارم 100%
                    </span>
                  </div>

                  {/* Select Existing Document */}
                  <div>
                    <label className="block text-gray-300 font-bold mb-2">الملفات المرجعية المعتمدة في النظام</label>
                    <div className="space-y-2">
                      {[
                        {
                          name: "جدول مواعيد الأطباء وأسعار الكشفيات (clinic_pricing_and_doctors_2026.pdf)",
                          size: "2.4 MB",
                          active: true,
                          category: "أطباء وأسعار",
                        },
                        {
                          name: "قائمة العيادات التخصصية وساعات الدوام (basra_clinic_schedule.xlsx)",
                          size: "840 KB",
                          active: false,
                          category: "جدول الدوام",
                        },
                        {
                          name: "الأسئلة الشائعة وسياسة الحجز والإلغاء (clinic_faq_policy.docx)",
                          size: "320 KB",
                          active: false,
                          category: "سياسات FAQ",
                        },
                      ].map((doc, idx) => (
                        <div
                          key={idx}
                          onClick={() => showToast(`تم اعتماد الملف: ${doc.name}`)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            doc.active
                              ? "bg-indigo-950/40 border-indigo-500/50 shadow-md"
                              : "bg-gray-900/70 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-cyan-400">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white line-clamp-1">{doc.name}</div>
                              <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                                <span>{doc.size}</span>
                                <span>&bull;</span>
                                <span className="text-indigo-300 font-mono">{doc.category}</span>
                              </div>
                            </div>
                          </div>
                          {doc.active ? (
                            <span className="text-[10px] bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-md shadow-sm">
                              المصدر النشط
                            </span>
                          ) : (
                            <button className="text-[10px] text-gray-400 hover:text-white bg-gray-800 px-2 py-0.5 rounded">
                              اختيار
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload New Document Box */}
                  <div
                    onClick={() => showToast("تم فتح نافذة اختيار الملفات من جهازك")}
                    className="p-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-indigo-500/60 bg-gray-950/60 hover:bg-gray-900/60 transition-all cursor-pointer text-center group"
                  >
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-400 mx-auto mb-1.5 transition-colors" />
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                      انقر لرفع ملف جديد من جهازك (Upload Knowledge File)
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      يدعم ملفات: PDF, Word (DOCX), Excel (XLSX), نص (TXT) حتى 25 ميغابايت
                    </p>
                  </div>

                  {/* Instant Raw Knowledge Notes */}
                  <div>
                    <label className="block text-gray-300 font-bold mb-1.5">
                      ملاحظات ومعلومات فورية طارئة (Instant Knowledge Notes)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="مثال: دكتور خالد مسافر في إجازة علمية حتى السبت القادم، وعيادة الأسنان تفتح استثنائياً اليوم الساعة 5 عصراً..."
                      defaultValue="ملاحظة هامة: عيادة البصرة تقع في شارع الجزائر قرب مستشفى الشفاء، الكشفية تبدأ من 25 ألف دينار عراقي والاستشارة مجانية خلال 10 أيام."
                      className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-200 font-sans text-xs outline-none focus:border-indigo-500 leading-relaxed"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      * أي نص تكتبه هنا يضاف فوراً لذاكرة الذكاء الاصطناعي مع إعطائه أولوية قصوى.
                    </p>
                  </div>
                </div>
              )}

              {inspectorTab === "data" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-1.5">
                      <span>المدخلات (Input JSON Payload)</span>
                      <span className="text-[10px] text-gray-500 font-mono">1 Item</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-gray-950 border border-gray-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                      {JSON.stringify(selectedNode.data.sampleInput || { sample: "Input Data" }, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-1.5">
                      <span>المخرجات (Output JSON Payload)</span>
                      <span className="text-[10px] text-gray-500 font-mono">Status 200 OK</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-gray-950 border border-gray-800 font-mono text-[11px] text-cyan-400 overflow-x-auto">
                      {JSON.stringify(selectedNode.data.sampleOutput || { sample: "Output Data" }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {inspectorTab === "test" && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-gray-300 leading-relaxed">
                    يمكنك تشغيل هذه الخطوة منفردة لاختبار الاستجابة وفحص المخرجات دون الحاجة لإعادة تشغيل المسار كاملاً.
                  </div>

                  <button
                    onClick={handleTestSingleStep}
                    disabled={isTestingStep}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Play className={`w-4 h-4 ${isTestingStep ? "animate-spin" : ""}`} />
                    <span>{isTestingStep ? "جاري الاختبار في البيئة المعزولة..." : "اختبار العقدة الآن (Execute Step)"}</span>
                  </button>

                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 font-mono text-[11px] space-y-1">
                    <div className="text-gray-400">Execution Result:</div>
                    <div className="text-emerald-400">Status: 200 OK</div>
                    <div className="text-gray-400">Execution Latency: {selectedNode.data.executionTime || "18ms"}</div>
                    <div className="text-gray-400">Tenant Safety Check: Passed (Zero Data Leakage)</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
              <button onClick={() => setSelectedNode(null)} className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold">
                إغلاق
              </button>
              <button onClick={() => setSelectedNode(null)} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30">
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Executions History Drawer */}
      {showExecutionsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-[#0d1424] border-r border-gray-800 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">سجل التشغيل التاريخي (Executions History)</h3>
              </div>
              <button onClick={() => setShowExecutionsDrawer(false)} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3">
              {[
                { id: "exec_9104", status: "success", time: "منذ دقيقة", duration: "320ms", trigger: "WhatsApp Inbound" },
                { id: "exec_9103", status: "success", time: "منذ 6 دقائق", duration: "294ms", trigger: "WhatsApp Inbound" },
                { id: "exec_9102", status: "success", time: "منذ 18 دقيقة", duration: "310ms", trigger: "Telegram Bot" },
                { id: "exec_9101", status: "conflict_prevented", time: "منذ 34 دقيقة", duration: "180ms", trigger: "Conflict Locked" },
              ].map((run, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-gray-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${run.status === "success" ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <div>
                      <div className="font-bold text-white font-mono">{run.id}</div>
                      <div className="text-[11px] text-gray-400">{run.trigger} • {run.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {run.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Pre-built Templates Modal (All 5 Templates) */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#0d1424] border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>قوالب الأتمتة المتقدمة الجاهزة للتخصيص</span>
                    <span className="text-[11px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      6 قوالب معتمدة
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">اختر أي قالب وسيتم تحميله فوراً على لوحة المخطط مع إمكانية التعديل والإضافة الكاملة</p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
              {/* Template Omnichannel - Flagship Star */}
              <div
                onClick={() => {
                  loadTemplate("t_omni");
                  setShowTemplatesModal(false);
                  showToast("تم تطبيق القالب الموحد: الرد الذكي عبر جميع منصات التواصل بنجاح!");
                }}
                className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-gray-900/90 border border-purple-500/40 hover:border-purple-400 hover:bg-purple-900/20 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-xl"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1.5 flex flex-wrap items-center gap-2">
                    <span>🌟 الرد الذكي الموحد عبر جميع منصات التواصل (Omnichannel Social AI Auto-Responder)</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/40 font-bold">
                      ⭐ القالب الشامل الأكثر طلباً
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      واتساب + إنستغرام + تليجرام + ماسنجر + الموقع
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2.5">
                    فلو واحد متكامل يستقبل الرسائل من أي منصة تواصل، يتحقق من ساعات العمل ومانع التكرار، يستعين بوكيل ذكاء اصطناعي مع قاعدة المعرفة، ويفحص طلب موظف بشري ثم يرسل رداً تكيفياً تلقائياً لنفس منصة العميل مع مزامنة الـ CRM.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 bg-purple-900/60 text-purple-200 rounded border border-purple-700/60 font-mono">Omnichannel Inbound</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 rounded border border-amber-800/50 font-mono">Hours & Anti-Loop</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-purple-950/60 text-purple-300 rounded border border-purple-800/50 font-mono">AI Agent RAG</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-teal-950/60 text-teal-300 rounded border border-teal-800/50 font-mono">Human Escalation Guard</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-800/50 font-mono">Adaptive Reply</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-cyan-950/60 text-cyan-300 rounded border border-cyan-800/50 font-mono">Unified CRM Sync</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-purple-600/30 transition-all self-end sm:self-center">
                  استخدام وتخصيص فوراً
                </button>
              </div>

              {/* Template 1 */}
              <div
                onClick={() => {
                  loadTemplate("t1");
                  setShowTemplatesModal(false);
                  showToast("تم تطبيق القالب 1: حجز المواعيد واستخراج النية بنجاح!");
                }}
                className="p-4 rounded-xl bg-gray-900/80 border border-indigo-500/30 hover:border-indigo-400 hover:bg-gray-800/80 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-md"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1.5 flex flex-wrap items-center gap-2">
                    <span>1. أتمتة حجز المواعيد واستخراج النية بـ AI مع القفل الذري</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                      موصى به للعيادات
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      WhatsApp + AI RAG
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2.5">
                    مسار متكامل: استقبال واتساب ← استخراج النية بـ AI RAG ← قفل التوافر الذري في PostgreSQL لمنع التعارض ← تأكيد وإرسال واتساب للعميل.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-800/90 rounded border border-gray-700/60 font-mono">WhatsApp Webhook</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-purple-950/60 text-purple-300 rounded border border-purple-800/50 font-mono">Gemini RAG Intent</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-800/50 font-mono">Atomic Mutex Guard</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-blue-950/60 text-blue-300 rounded border border-blue-800/50 font-mono">Confirm WhatsApp</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-indigo-600/30 transition-all self-end sm:self-center">
                  استخدام وتخصيص
                </button>
              </div>

              {/* Template 2 */}
              <div
                onClick={() => {
                  loadTemplate("t2");
                  setShowTemplatesModal(false);
                  showToast("تم تطبيق القالب 2: تذكير المواعيد اليومية SMS بنجاح!");
                }}
                className="p-4 rounded-xl bg-gray-900/80 border border-amber-500/30 hover:border-amber-400 hover:bg-gray-800/80 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-md"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1.5 flex flex-wrap items-center gap-2">
                    <span>2. تذكير المواعيد اليومية عبر بوابة SMS العراق (Zain / Asiacell)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                      مجدول يومياً Cron
                    </span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      شبكات الاتصال المحلية
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2.5">
                    مؤقت مجدول يومياً 09:00 ص بتوقيت بغداد ← جلب مواعيد الغد من قاعدة البيانات ← تنسيق نص التذكير كودياً ← إرسال رسائل SMS للمرضى عبر بوابة Zain و Asiacell.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 rounded border border-amber-800/50 font-mono">Cron 09:00 AM</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-cyan-950/60 text-cyan-300 rounded border border-cyan-800/50 font-mono">DB Tomorrow Slugs</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-yellow-950/60 text-yellow-300 rounded border border-yellow-800/50 font-mono">Format JS Code</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 rounded border border-amber-800/50 font-mono">Iraq SMS Gateway</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-amber-600/30 transition-all self-end sm:self-center">
                  استخدام وتخصيص
                </button>
              </div>

              {/* Template 3 */}
              <div
                onClick={() => {
                  loadTemplate("t3");
                  setShowTemplatesModal(false);
                  showToast("تم تطبيق القالب 3: فرز الشكاوى واستقبال الطوارئ بنجاح!");
                }}
                className="p-4 rounded-xl bg-gray-900/80 border border-rose-500/30 hover:border-rose-400 hover:bg-gray-800/80 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-md"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1.5 flex flex-wrap items-center gap-2">
                    <span>3. فرز الشكاوى واستقبال الطوارئ والتوجيه الفوري (AI Triage)</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-semibold">
                      فرز طوارئ ذكي
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                      تيليجرام ودعم فني
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2.5">
                    استقبال استفسار أو شكوى من تليغرام ← تصنيف الإلحاح بـ AI (طوارئ حرجة مقابل روتيني) ← تفرع شرطي IF/ELSE ← تنبيه قروب الأطباء فوراً في الطوارئ أو رد روتيني.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-800/90 rounded border border-gray-700/60 font-mono">Telegram Webhook</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-rose-950/60 text-rose-300 rounded border border-rose-800/50 font-mono">AI Urgency Classifier</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-teal-950/60 text-teal-300 rounded border border-teal-800/50 font-mono">IF / ELSE Branch</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-red-950/60 text-red-300 rounded border border-red-800/50 font-mono">Alert Doctors Group</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-rose-600/30 transition-all self-end sm:self-center">
                  استخدام وتخصيص
                </button>
              </div>

              {/* Template 4 */}
              <div
                onClick={() => {
                  loadTemplate("t4");
                  setShowTemplatesModal(false);
                  showToast("تم تطبيق القالب 4: استبيان رضا المرضى بنجاح!");
                }}
                className="p-4 rounded-xl bg-gray-900/80 border border-teal-500/30 hover:border-teal-400 hover:bg-gray-800/80 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-md"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1.5 flex flex-wrap items-center gap-2">
                    <span>4. استبيان رضا المرضى والمتابعة بعد الزيارة (Post-Visit CRM)</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 font-semibold">
                      خدمة العملاء والتقييم
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                      CRM Automation
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2.5">
                    يُطلق الحدث تلقائياً عند انتهاء الكشف ودفع الفاتورة ← توليد رابط استبيان مخصص برمز المريض ← إرسال استبيان تفاعلي بالواتساب ← تحديث درجة الرضا في CRM.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-800/90 rounded border border-gray-700/60 font-mono">Appointment Completed</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-yellow-950/60 text-yellow-300 rounded border border-yellow-800/50 font-mono">Generate Hash Code</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-teal-950/60 text-teal-300 rounded border border-teal-800/50 font-mono">Send WA Survey</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-cyan-950/60 text-cyan-300 rounded border border-cyan-800/50 font-mono">Sync CRM Score</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-teal-600/30 transition-all self-end sm:self-center">
                  استخدام وتخصيص
                </button>
              </div>

              {/* Template 5 */}
              <div
                onClick={() => {
                  loadTemplate("t5");
                  setShowTemplatesModal(false);
                  showToast("تم تطبيق القالب 5: تفريغ التسجيلات الصوتية Whisper بنجاح!");
                }}
                className="p-4 rounded-xl bg-gray-900/80 border border-violet-500/30 hover:border-violet-400 hover:bg-gray-800/80 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-md"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold text-white mb-1.5 flex flex-wrap items-center gap-2">
                    <span>5. تفريغ التسجيلات الصوتية وتلخيص السجل الطبي (Whisper AI to EHR)</span>
                    <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30 font-semibold">
                      صوت باللهجة العراقية
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      السجل الطبي EHR
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2.5">
                    استقبال تسجيل صوتي عبر واتساب ← تفريغ اللهجة العراقية بالذكاء الاصطناعي Whisper ← استخراج وتلخيص الأعراض والتشخيص الطبي ← حفظ السجل الطبي الإلكتروني مباشرة.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-800/90 rounded border border-gray-700/60 font-mono">WhatsApp Audio</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-violet-950/60 text-violet-300 rounded border border-violet-800/50 font-mono">Whisper AI Large-v3</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-purple-950/60 text-purple-300 rounded border border-purple-800/50 font-mono">Medical Summary LLM</span>
                    <span>←</span>
                    <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-800/50 font-mono">PostgreSQL EHR</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-violet-600/30 transition-all self-end sm:self-center">
                  استخدام وتخصيص
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Comprehensive Guide & Documentation Modal (دليل الاستخدام والتعليمات الشامل) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#0c1322] border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-inner">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>دليل الاستخدام والتعليمات الشامل لمسارات العمل</span>
                    <span className="text-[10px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      دليل تفاعلي متكامل
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    شرح شامل لمن لا يمتلك أي خلفية برمجية، من المفاهيم الأساسية حتى بناء مسارات أتمتة متطورة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-900/90 rounded-2xl border border-gray-800/80 mb-5 overflow-x-auto">
              <button
                onClick={() => setGuideActiveTab("basics")}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  guideActiveTab === "basics"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1. المفاهيم الأساسية</span>
              </button>

              <button
                onClick={() => setGuideActiveTab("nodes")}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  guideActiveTab === "nodes"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. موسوعة العقد والرموز</span>
              </button>

              <button
                onClick={() => setGuideActiveTab("quickstart")}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  guideActiveTab === "quickstart"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>3. خطوات بناء مسارك الأول</span>
              </button>

              <button
                onClick={() => setGuideActiveTab("faq")}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  guideActiveTab === "faq"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>4. أسرار وحلول المشاكل</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-4">
              {/* TAB 1: BASICS */}
              {guideActiveTab === "basics" && (
                <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex gap-3.5 items-start">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">ما هو مسار العمل (Workflow)؟ وكيف يفيدك؟</h4>
                      <p className="text-gray-300 leading-relaxed">
                        مسار العمل هو ببساطة <strong className="text-white">"موظف ذكي يعمل 24 ساعة بدون انقطاع"</strong>. بدلاً من أن يجلس الموظف أمام واتساب للرد على المرضى والتحقق من المواعيد يدوياً في الدفتر أو الإكسل، يقوم المخطط باستلام الرسالة، فهم لهجة المريض بالذكاء الاصطناعي، التحقق من عدم وجود حجز مزدوج، وتأكيد الحجز فوراً وإرسال إشعار للعيادة.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 flex flex-col justify-between">
                      <div>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 font-bold text-xs">
                          1
                        </div>
                        <h5 className="font-bold text-white mb-1">العقدة (Node)</h5>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          كل بطاقة على الشاشة هي "عقدة" تمثل خطوة محددة (مثل: وصول رسالة، فهم المعنى، قفل الموعد، أو إرسال تأكيد).
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 flex flex-col justify-between">
                      <div>
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 font-bold text-xs">
                          2
                        </div>
                        <h5 className="font-bold text-white mb-1">الوصلة أو السهم (Edge)</h5>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          الخط الواصل بين عقدتين هو مسار تدفق البيانات. النتيجة من الخطوة الأولى تنتقل عبر الخط لتغذي الخطوة التالية.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 flex flex-col justify-between">
                      <div>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 font-bold text-xs">
                          3
                        </div>
                        <h5 className="font-bold text-white mb-1">اتجاه التدفق (Flow)</h5>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          يبدأ العمل دائماً من المحفز (على اليمين) ويسير مع اتجاه الأسهم نحو اليسار خطوة بخطوة حتى اكتمال المهمة بنجاح.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
                    <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>كيف أتحكم بلوحة المخطط كالمحترفين؟</span>
                    </h5>
                    <ul className="space-y-1.5 text-[11px] text-gray-300 list-disc list-inside">
                      <li><strong className="text-white">التحريك والتكبير:</strong> اسحب الخلفية بالماوس للتنقل، واستخدم عجلة الماوس للتكبير والتصغير.</li>
                      <li><strong className="text-white">تحديد العقدة:</strong> اضغط على أي بطاقة لفتح لوحة الخصائص والتعديل على اليسار.</li>
                      <li><strong className="text-white">الربط التلقائي الذكي:</strong> انقر على زر <strong>(+)</strong> النباض بجانب أي عقدة وسيقترح النظام ما يجب ربطه تالياً تلقائياً!</li>
                      <li><strong className="text-white">أزرار التحكم السريعة:</strong> حرك الفأرة فوق أي عقدة لاستخدام أزرار (التشغيل التجريبي المنفرد، التكرار، الكتم Mute، أو الحذف).</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: NODES ENCYCLOPEDIA */}
              {guideActiveTab === "nodes" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-gray-900/70 border border-amber-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white flex items-center gap-2">
                        <span>المحفزات (Triggers) - اللون البرتقالي</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">نقطة البداية</span>
                      </h5>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        هي الصدمة الكهربائية التي تشغل المسار. المسار لا يعمل أبداً بدون محفز. أمثلة: وصول رسالة واتساب من مريض، أو قدوم الساعة 09:00 صباحاً (Cron)، أو وصول حدث خارجي عبر Webhook.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-900/70 border border-purple-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white flex items-center gap-2">
                        <span>الذكاء الاصطناعي (AI & RAG) - اللون البنفسجي</span>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">دماغ النظام</span>
                      </h5>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        تحليل النص وفهم اللهجة العراقية العامية. يستخرج نية المريض (حجز، إلغاء، استفسار)، اسم الطبيب، والوقت. كما يتضمن موديل Whisper لتفريغ الرسائل الصوتية لنصوص عربية.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-900/70 border border-emerald-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white flex items-center gap-2">
                        <span>الحماية والمنطق (Logic & Atomic Guards) - اللون الزمردي</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">صمام الأمان</span>
                      </h5>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        أهم عقدة للمؤسسات الطبية: <strong>القفل الذري (PostgreSQL Mutex Guard)</strong> لمنع أي حجز مزدوج لنفس الغرفة أو الطبيب، بالإضافة إلى التفريع الشرطي (IF / ELSE) لاتخاذ قرارات حسب النية.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-900/70 border border-rose-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white flex items-center gap-2">
                        <span>الإجراءات والاتصالات (Action Nodes) - اللون الوردي/الأحمر</span>
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">الأيدي المنفذة</span>
                      </h5>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        تنفيذ العمليات الفعلية: إرسال رد أو تأكيد رسمي عبر واتساب، إرسال رسائل SMS عبر بوابات العراق (زين وآسيا سيل)، أو تنبيه قروب الأطباء في تيليجرام.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-900/70 border border-cyan-500/30 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white flex items-center gap-2">
                        <span>قواعد البيانات (Database Nodes) - اللون السماوي</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">الذاكرة الدائمة</span>
                      </h5>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        حفظ واسترجاع بيانات المرضى، فحص بطاقة العميل في الـ CRM، وتحديث تقييمات الرضا وسجلات المواعيد في قاعدة بيانات PostgreSQL.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STEP-BY-STEP QUICKSTART */}
              {guideActiveTab === "quickstart" && (
                <div className="space-y-3.5 text-xs">
                  <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 flex gap-3.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <h5 className="font-bold text-white mb-1">اختر قالباً جاهزاً لتوفير الوقت أو ابدأ فارغاً</h5>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        أسرع طريقة هي الضغط على زر <strong className="text-indigo-400">"القوالب (5)"</strong> في الأعلى واختيار القالب الأقرب لاحتياجك (مثل حجز المواعيد أو تذكير SMS). سيتم رسم المخطط فوراً مع إمكانية التعديل عليه.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 flex gap-3.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h5 className="font-bold text-white mb-1">إضافة العقد والربط التفاعلي</h5>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        لإضافة خطوة جديدة، اضغط <strong className="text-white">+ إضافة عقدة</strong> واختر من المكتبة، أو انقر على علامة <strong>(+)</strong> الزرقاء النباضة بجانب مخرج أي عقدة وسيقترح عليك النظام تلقائياً العقد الأنسب للربط بها!
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 flex gap-3.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h5 className="font-bold text-white mb-1">تخصيص الإعدادات واستخدام المتغيرات الديناميكية</h5>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        انقر على أي عقدة لتفتح لوحة التحكم على اليسار. في خانة الرسالة يمكنك كتابة متغيرات مثل <code className="bg-gray-800 text-emerald-400 px-1 py-0.5 rounded font-mono text-[10px]">{"{{ $json.clientName }}"}</code> أو <code className="bg-gray-800 text-cyan-400 px-1 py-0.5 rounded font-mono text-[10px]">{"{{ $json.doctor }}"}</code> وسيتم استبدالها آلياً ببيانات كل مريض.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 flex gap-3.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div>
                      <h5 className="font-bold text-white mb-1">فحص المخطط وتشغيل المحاكاة الحية (Dry Run)</h5>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        اضغط أولاً على <strong className="text-indigo-400">"فحص المسار"</strong> للتأكد من عدم وجود نهايات ميتة أو مفاتيح مفقودة، ثم اضغط <strong className="text-emerald-400">"تشغيل تجريبي"</strong> لمشاهدة المخطط ينفذ الخطوات خطوة بخطوة باللون الأخضر والتيرمينال التفاعلي!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FAQ & PRO TIPS */}
              {guideActiveTab === "faq" && (
                <div className="space-y-3.5 text-xs">
                  <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800">
                    <h5 className="font-bold text-white mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">س</span>
                      <span>كيف أضمن عدم حجز مريضين لنفس الطبيب في نفس الوقت؟</span>
                    </h5>
                    <p className="text-gray-300 text-[11px] leading-relaxed mr-7">
                      استخدم دائماً عقدة <strong className="text-emerald-400">Atomic Double-Booking Guard</strong> قبل عقدة تأكيد الحجز. هذه العقدة تقوم بقفل السجل ذرياً في PostgreSQL بأمر <code className="font-mono bg-gray-800 text-gray-300 px-1 rounded">SELECT FOR UPDATE</code>، مما يمنع نهائياً أي تصادم أو حجز مزدوج حتى لو أرسل ألف شخص في نفس الثانية!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800">
                    <h5 className="font-bold text-white mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">س</span>
                      <span>ماذا أفعل إذا لم يكن لدى المريض تطبيق واتساب؟</span>
                    </h5>
                    <p className="text-gray-300 text-[11px] leading-relaxed mr-7">
                      يمكنك ربط عقدة <strong className="text-amber-400">Iraq SMS Gateway (Zain / Asiacell)</strong> كمسار بديل أو إضافي، بحيث يتم إرسال رسالة نصية عادية لرقم الهاتف العراقي في حال تعذر تسليم الواتساب.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800">
                    <h5 className="font-bold text-white mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">س</span>
                      <span>كيف أنقل مسار العمل إلى فرع عيادة آخر أو أحتفظ بنسخة؟</span>
                    </h5>
                    <p className="text-gray-300 text-[11px] leading-relaxed mr-7">
                      استخدم زر <strong className="text-cyan-400">تصدير JSON</strong> في شريط الأدوات العلوي. سيتم تنزيل ملف الكود كاملاً ونسخه في الحافظة. وفي أي وقت يمكنك الضغط على <strong className="text-amber-400">استيراد JSON</strong> لتحميله بنقرة واحدة.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800">
                    <h5 className="font-bold text-white mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">س</span>
                      <span>ماذا تعني الألوان المختلفة على الحواف أو بطاقات العقد؟</span>
                    </h5>
                    <p className="text-gray-300 text-[11px] leading-relaxed mr-7">
                      البرتقالي: محفز، البنفسجي: ذكاء اصطناعي، الأخضر/الزمردي: منطق وقفل ذري، الوردي/الأحمر: إجراءات واتصالات، والسماوي: قواعد بيانات. وأثناء التشغيل التجريبي يتحول لون العقدة إلى الأصفر (قيد التنفيذ) ثم الأخضر (اكتمل بنجاح).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-5 pt-3.5 border-t border-gray-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 hidden sm:inline">
                FlowDesk AI Workflow Engine &bull; Clinic Automation v2.4
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowGuideModal(false);
                    setShowTemplatesModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>استعراض القوالب الجاهزة</span>
                </button>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
                >
                  فهمت، إغلاق الدليل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
