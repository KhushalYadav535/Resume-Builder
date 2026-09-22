import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { Resume, WorkExperience } from '@/types';
import { QuestionDef } from '@/lib/cde/questionConfig';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Check if user has an active session
    let { data: session, error } = await adminSupabase
      .from('cde_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Session query note:', error);
    }

    // Create new session if none exists
    if (!session) {
      const { data: newSession, error: createError } = await adminSupabase
        .from('cde_sessions')
        .insert({ user_id: user.id, status: 'in_progress' })
        .select()
        .single();

      if (createError) throw createError;
      session = newSession;
    }

    // Fetch facts for this session
    const { data: facts } = await adminSupabase
      .from('cde_facts')
      .select('fact_key, fact_value')
      .eq('session_id', session.id);

    const knownFacts =
      facts?.reduce((acc: any, fact) => {
        acc[fact.fact_key] = fact.fact_value;
        return acc;
      }, {}) || {};

    // ─── EXTRACT RESUME CONTEXT TO SYNTHESIZE DYNAMIC QUESTIONS ───
    const { data: userResumes } = await adminSupabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const activeResume: Resume | null =
      userResumes?.find((r) => r.is_base_resume) || userResumes?.[0] || null;

    const resumeData: any = activeResume?.resume_data || {};
    const workExperiences: WorkExperience[] = Array.isArray(resumeData.workExperience)
      ? resumeData.workExperience
      : [];

    const primaryRole = workExperiences[0]?.role || 'Software Specialist';
    const primaryCompany = workExperiences[0]?.company || 'Technology Services';
    const candidateName = resumeData.personalInfo?.name || 'Candidate';

    const companiesList = Array.from(
      new Set(
        workExperiences
          .map((w) => w.company?.trim())
          .filter((c): c is string => Boolean(c && c.length > 1))
      )
    );

    // Extract verified skills from resume
    const extractedTechSkills = Array.isArray(resumeData.skills?.technical)
      ? resumeData.skills.technical
      : [];
    const extractedSoftSkills = Array.isArray(resumeData.skills?.soft)
      ? resumeData.skills.soft
      : [];

    // Combine skills and add standard high-demand tags
    const combinedSkillOptions = Array.from(
      new Set([
        ...extractedTechSkills,
        ...extractedSoftSkills,
        '.NET Core',
        'C#',
        'AngularJS',
        'TypeScript',
        'React',
        'Next.js',
        'Entity Framework',
        'Web API',
        'SQL Server',
        'Azure Cloud',
        'Docker',
        'Agile Scrum',
        'Microservices',
        'System Architecture',
        'CI/CD Pipelines',
      ])
    ).slice(0, 20);

    // Calculate approximate years of experience
    let estimatedYears = 5;
    if (workExperiences.length >= 4) {
      estimatedYears = 9;
    } else if (workExperiences.length >= 2) {
      estimatedYears = 5;
    } else if (workExperiences.length === 1) {
      estimatedYears = 2;
    }

    const hasResume = Boolean(activeResume);

    // ─── DYNAMIC QUESTIONS GENERATION ───
    const dynamicQuestions: Record<string, QuestionDef> = {
      q_role_type: {
        id: 'q_role_type',
        title: 'Core Specialization',
        question: hasResume
          ? `Confirm your primary engineering domain:`
          : 'Which best describes your professional role?',
        helpText: hasResume
          ? `Detected from your role as ${primaryRole} at ${primaryCompany}`
          : 'Select your primary discipline to tailor your discovery card deck.',
        type: 'choice',
        options: hasResume
          ? [
              { label: `${primaryRole} · Primary Focus`, value: primaryRole },
              { label: 'Fullstack & Cloud Native Engineering', value: 'fullstack_cloud' },
              { label: 'Systems Analysis & Enterprise Architecture', value: 'systems_analysis' },
              { label: 'Technical Pod Leadership & Scrum Delivery', value: 'tech_lead' },
            ]
          : [
              { label: 'Software Engineering & Architecture', value: 'software_engineering' },
              { label: 'Product Management & Systems', value: 'product_management' },
              { label: 'Cloud, DevOps & Infrastructure', value: 'devops_cloud' },
              { label: 'Data Engineering & Analytics', value: 'data_engineering' },
            ],
      },
      q_tech_stack: {
        id: 'q_tech_stack',
        title: 'Technology Stack',
        question: 'Which core frameworks and technologies do you specialize in?',
        helpText: hasResume && activeResume
          ? `Pre-populated with your verified skills from ${activeResume.file_name || 'Resume'}. Select or add more:`
          : 'Select up to 10 frameworks and tools that define your engineering capabilities:',
        type: 'multi-select',
        options: combinedSkillOptions.map((s) => ({ label: s, value: s })),
      },
      q_experience_years: {
        id: 'q_experience_years',
        title: 'Career Tenure',
        question: 'Total years of hands-on professional industry experience:',
        helpText: hasResume
          ? `Estimated ${estimatedYears}+ years based on your career trajectory.`
          : 'Slide to indicate your cumulative professional experience:',
        type: 'slider',
        options: [
          { label: '0 Yrs', value: '0' },
          { label: '20+ Yrs', value: '20' },
        ],
      },
      q_company: {
        id: 'q_company',
        title: 'Highlighted Experience',
        question: 'Which company or organization would you like to highlight?',
        helpText: hasResume && companiesList.length > 0
          ? `Quickly select from your verified career record or search another:`
          : 'Search or type your target employer / recent organization:',
        type: 'search',
        options: (companiesList.length > 0 ? companiesList : ['Google', 'Microsoft', 'Hexaware Technologies', 'Amazon', 'TCS']).map((c) => ({
          label: c,
          value: c,
        })),
      },
      q_leadership: {
        id: 'q_leadership',
        title: 'Team Scope',
        question: 'Did you manage, mentor engineers, or lead cross-functional delivery?',
        helpText: 'Leadership scope establishes management and senior grade readiness.',
        type: 'choice',
        options: [
          { label: 'Yes — Mentored engineers or led delivery pods', value: 'yes' },
          { label: 'Individual Contributor — Focused on high-impact execution', value: 'no' },
        ],
      },
      q_team_size: {
        id: 'q_team_size',
        title: 'Pod Scale',
        question: 'Approximately how many team members or reports were in your squad?',
        helpText: 'Select team size (engineers, QA, designers, or direct reports).',
        type: 'number',
      },
      q_biggest_achievement: {
        id: 'q_biggest_achievement',
        title: 'Quantified Impact',
        question: hasResume
          ? `Describe a high-impact technical deliverable at ${primaryCompany}:`
          : 'Describe your most significant technical achievement or project milestone:',
        helpText: 'Include approximate numbers (e.g. 40% error reduction, latency gains, or delivery speed).',
        type: 'ai-chat',
        aiHint: 'Extract quantifiable metrics, technologies used, and business outcome in STAR format.',
      },
      q_voice_achievement: {
        id: 'q_voice_achievement',
        title: 'Story & Challenge',
        question: hasResume
          ? `Tell us a story about a complex challenge you overcame at ${primaryCompany}:`
          : 'Tell us a story about a technical bottleneck or challenge you resolved:',
        helpText: 'Use voice speech-to-text or type in your own words. We will structure the impact.',
        type: 'voice',
        aiHint: 'Extract problem, action taken, and measurable outcome.',
      },
    };

    const questionQueue = [
      'q_role_type',
      'q_tech_stack',
      'q_experience_years',
      'q_company',
      'q_leadership',
      'q_biggest_achievement',
      'q_voice_achievement',
    ];

    const resumeContext = {
      hasResume,
      candidateName,
      primaryRole,
      primaryCompany,
      companiesList,
      extractedTechSkills,
      estimatedYears,
      fileName: activeResume?.file_name || 'Resume.pdf',
    };

    return NextResponse.json({
      session,
      knownFacts,
      resumeContext,
      dynamicQuestions,
      questionQueue,
    });
  } catch (error) {
    console.error('Error with CDE session initialization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
