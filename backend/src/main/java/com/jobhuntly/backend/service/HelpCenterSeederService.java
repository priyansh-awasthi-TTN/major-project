package com.jobhuntly.backend.service;

import com.jobhuntly.backend.entity.HelpArticle;
import com.jobhuntly.backend.repository.HelpArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class HelpCenterSeederService implements ApplicationRunner {

    @Autowired
    private HelpArticleRepository helpArticleRepository;
    
    @Autowired
    private com.jobhuntly.backend.repository.HelpArticleFeedbackRepository helpArticleFeedbackRepository;

    private static final Object[][] DEFAULT_ARTICLES = {
        // Getting Started (15 articles)
        {1, "Getting Started", "What is My Applications?", "My Applications is a way for you to track jobs as you move through the application process. Depending on the job you applied to, you may also receive notifications indicating that an application has been actioned by an employer.", "2024-07-24"},
        {2, "Getting Started", "How to access my applications history", "To access applications history, go to your My Applications page on your dashboard profile. You must be signed in to your JobHuntly account to view this page.", "2024-07-20"},
        {3, "Getting Started", "Not seeing jobs you applied in your my application list?", "Please note that we are unable to track materials submitted for jobs you apply to via an employer's site. As a result, these applications are not recorded in the My Applications section of your JobHuntly account. We suggest keeping a personal record of all positions you have applied to externally.", "2024-07-15"},
        {4, "Getting Started", "How do I create a JobHuntly account?", "Click the Sign Up button on the homepage. Fill in your email, password, and basic information. Verify your email address through the link sent to your inbox. Once verified, you can start applying for jobs.", "2024-07-23"},
        {5, "Getting Started", "What are the benefits of creating an account?", "With an account, you can save jobs, track applications, get personalized recommendations, upload your resume, create a public profile visible to recruiters, and receive job alerts matching your preferences.", "2024-07-21"},
        {6, "Getting Started", "How do I reset my password?", "Click Forgot Password on the login page. Enter your registered email address. Check your inbox for a password reset link. Click the link and create a new password. You can now log in with your new credentials.", "2024-07-19"},
        {7, "Getting Started", "Can I use JobHuntly without creating an account?", "You can browse jobs and companies without an account, but to apply for positions, save jobs, or track applications, you must create a free JobHuntly account.", "2024-07-17"},
        {8, "Getting Started", "How do I navigate the dashboard?", "The dashboard sidebar contains all main features: Dashboard overview, Network connections, Messages, My Applications, Find Jobs, Browse Companies, Job Actions, My Public Profile, Settings, and Help Center.", "2024-07-16"},
        {9, "Getting Started", "What is the difference between Dashboard and My Applications?", "Dashboard shows an overview of your activity including recent applications and recommendations. My Applications specifically lists all jobs you have applied to with their current status.", "2024-07-14"},
        {10, "Getting Started", "How do I delete my account?", "Go to Settings, scroll to the bottom, and click Delete Account. Confirm your decision. Note that this action is permanent and will remove all your data including applications and saved jobs.", "2024-07-13"},
        {11, "Getting Started", "Can I have multiple accounts?", "Each user should maintain only one account. Multiple accounts may violate our terms of service and could result in account suspension.", "2024-07-11"},
        {12, "Getting Started", "How do I contact support?", "Visit the Help Center and click Contact Us at the bottom. Fill in the support ticket form with your issue details. Our team typically responds within 24-48 hours.", "2024-07-09"},
        {13, "Getting Started", "Is JobHuntly free to use?", "Yes, JobHuntly is completely free for job seekers. You can create an account, apply for jobs, and use all features at no cost.", "2024-07-07"},
        {14, "Getting Started", "What browsers are supported?", "JobHuntly works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.", "2024-07-06"},
        {15, "Getting Started", "How do I enable notifications?", "Go to Settings and then Notifications. Toggle on the types of notifications you want to receive, such as application updates, messages, and job recommendations.", "2024-07-04"},
        
        // My Profile (18 articles)
        {16, "My Profile", "How do I update my profile photo?", "Go to Settings and then My Profile. Under the Profile Photo section, click the upload area or drag and drop an image. Supported formats include SVG, PNG, JPG, and GIF.", "2024-07-18"},
        {17, "My Profile", "How do I add work experience to my profile?", "Navigate to My Public Profile from the sidebar. Click the edit icon next to the Experience section and fill in your job title, company, dates, and description. Your profile is visible to recruiters.", "2024-07-10"},
        {18, "My Profile", "How do I add my education details?", "Go to My Public Profile and find the Education section. Click the edit icon, then add your degree, institution, field of study, graduation date, and any relevant achievements or honors.", "2024-07-22"},
        {19, "My Profile", "Can I add multiple resumes?", "Currently, you can upload one primary resume. However, you can update it anytime by going to Settings and uploading a new file. Your latest resume will be used for applications.", "2024-07-20"},
        {20, "My Profile", "What file formats are accepted for resumes?", "We accept PDF, DOC, and DOCX formats. Your resume file should be under 5MB. PDF is recommended for best formatting preservation.", "2024-07-18"},
        {21, "My Profile", "How do I add skills to my profile?", "In My Public Profile, locate the Skills section. Click edit and start typing skill names. Select from suggestions or add custom skills. Add up to 20 skills relevant to your career.", "2024-07-16"},
        {22, "My Profile", "Can recruiters see my profile?", "Yes, if you have created a public profile. Go to Settings and Privacy to control your profile visibility. You can make it visible to all recruiters or keep it private.", "2024-07-15"},
        {23, "My Profile", "How do I add a professional summary?", "Navigate to My Public Profile and click the edit icon in the About section. Write a brief summary highlighting your experience, skills, and career goals. Keep it concise and professional.", "2024-07-14"},
        {24, "My Profile", "Can I add certifications to my profile?", "Yes, in the My Public Profile section, you can add certifications under the Certifications area. Include the certification name, issuing organization, date obtained, and credential ID if applicable.", "2024-07-12"},
        {25, "My Profile", "How do I add my portfolio or website?", "In My Public Profile, you can add links to your portfolio, personal website, LinkedIn, GitHub, or other professional profiles in the Links section.", "2024-07-11"},
        {26, "My Profile", "What should I include in my profile headline?", "Your headline should be a brief statement of your current role or career focus, such as 'Senior Software Engineer' or 'Marketing Professional Seeking New Opportunities'.", "2024-07-09"},
        {27, "My Profile", "How do I update my contact information?", "Go to Settings and then My Profile. Update your email, phone number, and location. Make sure your contact information is current so employers can reach you.", "2024-07-08"},
        {28, "My Profile", "Can I hide my profile from specific companies?", "Currently, profile visibility is all-or-nothing. You can make your profile private in Settings if you don't want any companies to see it.", "2024-07-07"},
        {29, "My Profile", "How often should I update my profile?", "Update your profile whenever you gain new skills, complete projects, change jobs, or earn certifications. An up-to-date profile increases your chances of being discovered by recruiters.", "2024-07-05"},
        {30, "My Profile", "What makes a strong profile?", "A strong profile includes a professional photo, detailed work experience, relevant skills, education, certifications, a compelling summary, and an updated resume.", "2024-07-03"},
        {31, "My Profile", "Can I download my profile data?", "Yes, go to Settings and Privacy, then click Download My Data. You'll receive a file containing all your profile information, applications, and activity.", "2024-07-02"},
        {32, "My Profile", "How do I add languages I speak?", "In My Public Profile, find the Languages section and add languages you speak along with your proficiency level (basic, intermediate, fluent, or native).", "2024-06-30"},
        {33, "My Profile", "Can I reorder sections on my profile?", "Profile sections are currently in a fixed order optimized for recruiter viewing. However, you can choose which sections to display by editing your profile visibility settings.", "2024-06-28"},
        
        // Applying for a job (22 articles)
        {34, "Applying for a job", "How do I apply for a job on JobHuntly?", "Browse jobs via Find Jobs or Browse Companies. Open a job listing and click the Apply Now button. Fill in the application form and submit. You can track your application status under My Applications.", "2024-07-22"},
        {35, "Applying for a job", "Can I withdraw a job application?", "Yes. Go to My Applications, find the application you want to withdraw, click the three-dot menu on the right, and select Remove Application. Note that this action cannot be undone.", "2024-07-12"},
        {36, "Applying for a job", "Can I edit my application after submitting?", "Once submitted, applications cannot be edited. Make sure to review all information carefully before clicking Submit. If you need to update information, contact the employer directly.", "2024-07-21"},
        {37, "Applying for a job", "How long does it take to hear back from employers?", "Response times vary by company. Some respond within days, others may take weeks. You can check your application status in My Applications for any updates.", "2024-07-19"},
        {38, "Applying for a job", "Can I apply to multiple jobs at the same company?", "Yes, you can apply to multiple positions at the same company. Each application is reviewed separately based on the specific role requirements.", "2024-07-17"},
        {39, "Applying for a job", "What happens after I click Apply?", "Your application is sent to the employer. You'll receive a confirmation email. The employer reviews your application and updates the status, which you can track in My Applications.", "2024-07-16"},
        {40, "Applying for a job", "Do I need a cover letter for every application?", "Cover letter requirements vary by job. Some positions require them, others make them optional. Check the job listing for specific requirements.", "2024-07-15"},
        {41, "Applying for a job", "Can I save a job to apply later?", "Yes, click the bookmark icon on any job listing to save it. Access your saved jobs from the Job Actions menu in the sidebar.", "2024-07-14"},
        {42, "Applying for a job", "How do I know if my application was received?", "You'll receive a confirmation email after submitting. The job will also appear in your My Applications list with an 'In Review' status.", "2024-07-13"},
        {43, "Applying for a job", "Can I apply to jobs on mobile?", "Yes, JobHuntly is mobile-responsive. You can browse and apply for jobs from your smartphone or tablet browser.", "2024-07-11"},
        {44, "Applying for a job", "What should I include in my cover letter?", "Address the hiring manager, explain why you're interested in the role, highlight relevant experience and skills, and express enthusiasm for the opportunity. Keep it concise and tailored to the specific job.", "2024-07-10"},
        {45, "Applying for a job", "Can I apply without uploading a resume?", "Most jobs require a resume. However, if you have a complete profile, some employers may accept applications based on your profile information alone.", "2024-07-09"},
        {46, "Applying for a job", "How many jobs can I apply to?", "There's no limit to the number of jobs you can apply to. However, we recommend focusing on positions that match your skills and career goals for better success rates.", "2024-07-08"},
        {47, "Applying for a job", "What does 'Easy Apply' mean?", "Easy Apply jobs allow you to submit applications quickly using your saved profile and resume information without filling out lengthy forms.", "2024-07-06"},
        {48, "Applying for a job", "Can I track which jobs I've applied to?", "Yes, all your applications are listed in My Applications with their current status, application date, and company information.", "2024-07-05"},
        {49, "Applying for a job", "Why was my application rejected?", "Rejection reasons vary and may include qualifications mismatch, high competition, or position being filled. Use it as a learning opportunity and continue applying to other roles.", "2024-07-04"},
        {50, "Applying for a job", "Can I reapply to a job I was rejected from?", "You can reapply after 6 months or if the position is reposted. Make sure to update your resume and application materials before reapplying.", "2024-07-03"},
        {51, "Applying for a job", "How do I prepare for an interview?", "Research the company, review the job description, prepare answers to common questions, dress professionally, and prepare questions to ask the interviewer.", "2024-07-02"},
        {52, "Applying for a job", "What if I don't meet all the job requirements?", "If you meet 70-80% of the requirements and are passionate about the role, consider applying. Many employers are flexible and value potential and enthusiasm.", "2024-07-01"},
        {53, "Applying for a job", "Can I apply to expired job listings?", "No, once a job listing expires or is closed, you cannot submit new applications. Focus on active listings instead.", "2024-06-29"},
        {54, "Applying for a job", "How do I follow up on my application?", "Wait at least 1-2 weeks after applying. If the job listing includes contact information, you can send a polite follow-up email expressing continued interest.", "2024-06-27"},
        {55, "Applying for a job", "What are the most common application mistakes?", "Common mistakes include typos, generic cover letters, incomplete applications, not following instructions, and applying to jobs you're not qualified for.", "2024-06-25"},
        
        // Job Search Tips (20 articles)
        {56, "Job Search Tips", "How do I find remote jobs?", "In Find Jobs, use the Employment Type filter and select Remote. You can combine this with category, level, and salary filters to narrow down results to remote roles that match your skills.", "2024-07-19"},
        {57, "Job Search Tips", "What does each application status mean?", "In Review means the employer is reviewing your application. Interviewing means you have been selected for an interview. Assessment means a test or challenge is required. Offered means you received a job offer. Hired means you got the job. Unsuitable means you were not selected this time.", "2024-07-08"},
        {58, "Job Search Tips", "How do I use search filters effectively?", "Combine multiple filters like location, job type, experience level, and salary range to narrow results. Save your filter preferences for quick access to relevant jobs.", "2024-07-23"},
        {59, "Job Search Tips", "What keywords should I use in job search?", "Use specific job titles, skills, technologies, and industry terms. Try variations like 'software engineer' and 'software developer' to capture more results.", "2024-07-21"},
        {60, "Job Search Tips", "How often are new jobs posted?", "New jobs are posted daily. Check back regularly or enable job alerts to be notified when positions matching your criteria are posted.", "2024-07-20"},
        {61, "Job Search Tips", "Can I search for jobs by company?", "Yes, use the Browse Companies feature to explore companies and view all their open positions. You can also filter by company size and industry.", "2024-07-18"},
        {62, "Job Search Tips", "How do I find entry-level positions?", "Use the Experience Level filter and select Entry Level or Internship. You can also search for keywords like 'junior', 'associate', or 'entry-level'.", "2024-07-17"},
        {63, "Job Search Tips", "What's the best time to apply for jobs?", "Apply as soon as possible after a job is posted. Early applications often receive more attention. Tuesdays and Wednesdays tend to have higher employer activity.", "2024-07-16"},
        {64, "Job Search Tips", "How do I search for jobs in multiple locations?", "You can enter multiple cities in the location filter or search for broader regions. For remote work, select the Remote option to see location-independent roles.", "2024-07-15"},
        {65, "Job Search Tips", "Should I apply to jobs slightly above my experience level?", "Yes, if you meet most requirements. Employers often list ideal qualifications but may consider candidates with strong potential and transferable skills.", "2024-07-14"},
        {66, "Job Search Tips", "How do I identify legitimate job postings?", "Look for detailed job descriptions, company information, and professional language. Be wary of vague descriptions, requests for payment, or too-good-to-be-true offers.", "2024-07-13"},
        {67, "Job Search Tips", "Can I search for part-time jobs?", "Yes, use the Employment Type filter and select Part-Time. You can combine this with other filters to find part-time roles that match your needs.", "2024-07-12"},
        {68, "Job Search Tips", "How do I find jobs that match my salary expectations?", "Use the Salary Range filter to specify your minimum expected salary. This helps you focus on positions within your target compensation range.", "2024-07-11"},
        {69, "Job Search Tips", "What are the most in-demand skills?", "In-demand skills vary by industry but commonly include programming languages, data analysis, project management, digital marketing, and cloud technologies. Check job listings in your field to identify trends.", "2024-07-10"},
        {70, "Job Search Tips", "How do I stand out in a competitive job market?", "Tailor your resume and cover letter to each job, build a strong online presence, network actively, develop in-demand skills, and follow up professionally after applying.", "2024-07-09"},
        {71, "Job Search Tips", "Should I apply to jobs posted a while ago?", "Yes, if the listing is still active. Some positions remain open for weeks or months. However, prioritize recently posted jobs for better chances.", "2024-07-07"},
        {72, "Job Search Tips", "How do I research companies before applying?", "Visit the company's website, read reviews on sites like Glassdoor, check their social media, review their products or services, and look for recent news articles.", "2024-07-06"},
        {73, "Job Search Tips", "What's the difference between contract and full-time jobs?", "Full-time jobs offer permanent employment with benefits. Contract jobs are temporary positions for a specific duration or project, often without benefits but sometimes with higher pay.", "2024-07-05"},
        {74, "Job Search Tips", "How do I network effectively for job opportunities?", "Attend industry events, join professional groups, connect with people on LinkedIn, participate in online communities, and reach out to alumni from your school.", "2024-07-04"},
        {75, "Job Search Tips", "Can I filter jobs by company benefits?", "While there's no direct benefits filter, you can review individual job listings for benefits information. Many companies highlight benefits like health insurance, remote work, and professional development.", "2024-07-03"},
        
        // Job Alerts (12 articles)
        {76, "Job Alerts", "How do I set up job alerts?", "Job alerts can be configured in Settings and then Notifications. Enable the Recommendations toggle to receive personalized job alerts based on your profile, skills, and past applications.", "2024-07-05"},
        {77, "Job Alerts", "How do I stop receiving job alert emails?", "Go to Settings and then Notifications and toggle off the Recommendations option. You will no longer receive job alert emails. You can re-enable this at any time.", "2024-07-01"},
        {78, "Job Alerts", "How often will I receive job alerts?", "Job alert frequency depends on how many new jobs match your criteria. You may receive alerts daily, weekly, or as new matching positions are posted.", "2024-07-22"},
        {79, "Job Alerts", "Can I customize what jobs I get alerted about?", "Yes, job alerts are based on your profile, saved searches, and preferences. Update your profile and skills to receive more relevant alerts.", "2024-07-20"},
        {80, "Job Alerts", "Why am I not receiving job alerts?", "Check your notification settings to ensure alerts are enabled. Also verify your email address is correct and check your spam folder. Update your profile to improve alert relevance.", "2024-07-18"},
        {81, "Job Alerts", "Can I get alerts for specific companies?", "Currently, alerts are based on job criteria rather than specific companies. However, you can follow companies and check their pages regularly for new openings.", "2024-07-16"},
        {82, "Job Alerts", "How do I create multiple job alert preferences?", "While you can't create multiple separate alerts, you can broaden your profile skills and preferences to receive alerts for various types of positions.", "2024-07-14"},
        {83, "Job Alerts", "Are job alerts sent in real-time?", "Job alerts are sent periodically throughout the day as new matching jobs are posted. They're not instant but are typically sent within a few hours of posting.", "2024-07-12"},
        {84, "Job Alerts", "Can I get alerts for remote jobs only?", "Update your job preferences to indicate you're seeking remote work. This will prioritize remote positions in your job alert emails.", "2024-07-10"},
        {85, "Job Alerts", "How do I make my job alerts more relevant?", "Keep your profile updated with current skills and experience. Save jobs you're interested in and apply regularly. The system learns from your activity to improve recommendations.", "2024-07-08"},
        {86, "Job Alerts", "Can I pause job alerts temporarily?", "Yes, go to Settings and Notifications and toggle off job alerts. You can re-enable them anytime when you're ready to resume your job search.", "2024-07-06"},
        {87, "Job Alerts", "Do job alerts include salary information?", "Yes, when employers include salary information in job postings, it will be displayed in the job alert emails you receive.", "2024-07-04"}
    };

    @Override
    public void run(ApplicationArguments args) {
        // Clear existing feedback first (foreign key constraint), then articles, then reseed
        helpArticleFeedbackRepository.deleteAll();
        helpArticleRepository.deleteAll();

        for (Object[] row : DEFAULT_ARTICLES) {
            HelpArticle article = new HelpArticle();
            article.setSortOrder((Integer) row[0]);
            article.setCategory((String) row[1]);
            article.setQuestion((String) row[2]);
            article.setAnswer((String) row[3]);
            article.setPublishedAt(LocalDate.parse((String) row[4]));
            article.setIsActive(true);
            helpArticleRepository.save(article);
        }
    }
}
