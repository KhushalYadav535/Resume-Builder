import { NextRequest, NextResponse } from "next/server";
import { askAI } from "@/lib/openrouter";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { messages, resumeData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request payload: messages array is required." }, { status: 400 });
    }

    const resumeContext = resumeData
      ? `Current Resume Context:
- Full Name: ${resumeData.personalInfo?.fullName || "Not provided"}
- Industry Mode: ${resumeData.industryMode || "IT"}
- Fresher Mode: ${resumeData.fresherMode ? "Yes" : "No"}
- Target Salary / Current: ${resumeData.workExperience?.[0]?.currentCTC || "Not provided"}
- Skills: ${resumeData.skills?.technical?.join(", ") || "None"}
- Education: ${resumeData.education?.map((e: any) => `${e.level || ""} ${e.degree || ""} (${e.institution || ""})`).join("; ") || "None"}`
      : "No current resume data loaded yet.";

    const systemPrompt = `You are a Senior Career Coach and AI Resume Expert specializing in the Indian job market (including MNCs, IT Service giants like TCS/Infosys/Wipro, and fast-paced tech startups).

Your objective is to:
1. Provide highly actionable advice to improve the user's resume, ATS scores, and recruiter visibility.
2. Address and explain career gaps constructively (e.g., family care, UPSC preparation, health issues, skill upscaling).
3. Offer expert salary negotiation advice in Indian formats (₹, Lakhs, Crores, LPA, CTC structures).
4. Support and adapt to Hinglish queries (e.g., "Mera resume update kar do", "Is point ko improve kaise karein?") with warm, hybrid English/Hindi responses when prompted in Hinglish.
5. Reference their current resume details if provided.

${resumeContext}

Be warm, professional, encouraging, and highly specific in your advice. Return your responses in clean Markdown formats. Keep paragraphs concise and use bullet points where helpful.`;

    // Extract user prompt (last message)
    const userPrompt = messages[messages.length - 1]?.content || "";
    // If there is preceding history, format it into a string or pass the prompt.
    let fullPrompt = userPrompt;
    if (messages.length > 1) {
      const history = messages.slice(0, messages.length - 1).map((m: any) => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`).join("\n");
      fullPrompt = `Conversation History:\n${history}\n\nUser's Current Message: ${userPrompt}`;
    }

    const result = await askAI(fullPrompt, systemPrompt);

    return NextResponse.json({ message: result.trim() });
  } catch (err: any) {
    console.error("AI Coach Chat API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate AI Coach response." }, { status: 500 });
  }
}
