package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.HelpArticle;
import com.jobhuntly.backend.entity.HelpArticleFeedback;
import com.jobhuntly.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelpArticleFeedbackRepository extends JpaRepository<HelpArticleFeedback, Long> {
    List<HelpArticleFeedback> findByUser(User user);
    Optional<HelpArticleFeedback> findByUserAndArticle(User user, HelpArticle article);
}
