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

    private static final Object[][] DEFAULT_ARTICLES = {
        {1, "Getting Started", "What is My Applications?", "My Applications is a way for you to track jobs as you move through the application process. Depending on the job you applied to, you may also receive notifications indicating that an application has been actioned by an employer.", "2024-07-24"},
        {2, "Getting Started", "How to access my applications history", "To access applications history, go to your My Applications page on your dashboard profile. You must be signed in to your JobHuntly account to view this page.", "2024-07-20"},
        {3, "Getting Started", "Not seeing jobs you applied in your my application list?", "Please note that we are unable to track materials submitted for jobs you apply to via an employer's site. As a result, these applications are not recorded in the My Applications section of your JobHuntly account. We suggest keeping a personal record of all positions you have applied to externally.", "2024-07-15"},
        {4, "My Profile", "How do I update my profile photo?", "Go to Settings and then My Profile. Under the Profile Photo section, click the upload area or drag and drop an image. Supported formats include SVG, PNG, JPG, and GIF.", "2024-07-18"},
        {5, "My Profile", "How do I add work experience to my profile?", "Navigate to My Public Profile from the sidebar. Click the edit icon next to the Experience section and fill in your job title, company, dates, and description. Your profile is visible to recruiters.", "2024-07-10"},
        {6, "Applying for a job", "How do I apply for a job on JobHuntly?", "Browse jobs via Find Jobs or Browse Companies. Open a job listing and click the Apply Now button. Fill in the application form and submit. You can track your application status under My Applications.", "2024-07-22"},
        {7, "Applying for a job", "Can I withdraw a job application?", "Yes. Go to My Applications, find the application you want to withdraw, click the three-dot menu on the right, and select Remove Application. Note that this action cannot be undone.", "2024-07-12"},
        {8, "Job Search Tips", "How do I find remote jobs?", "In Find Jobs, use the Employment Type filter and select Remote. You can combine this with category, level, and salary filters to narrow down results to remote roles that match your skills.", "2024-07-19"},
        {9, "Job Search Tips", "What does each application status mean?", "In Review means the employer is reviewing your application. Interviewing means you have been selected for an interview. Assessment means a test or challenge is required. Offered means you received a job offer. Hired means you got the job. Unsuitable means you were not selected this time.", "2024-07-08"},
        {10, "Job Alerts", "How do I set up job alerts?", "Job alerts can be configured in Settings and then Notifications. Enable the Recommendations toggle to receive personalized job alerts based on your profile, skills, and past applications.", "2024-07-05"},
        {11, "Job Alerts", "How do I stop receiving job alert emails?", "Go to Settings and then Notifications and toggle off the Recommendations option. You will no longer receive job alert emails. You can re-enable this at any time.", "2024-07-01"}
    };

    @Override
    public void run(ApplicationArguments args) {
        if (helpArticleRepository.count() > 0) return;

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
