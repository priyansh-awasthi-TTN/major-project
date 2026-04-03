package com.jobhuntly.backend.repository;

import com.jobhuntly.backend.entity.HelpArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpArticleRepository extends JpaRepository<HelpArticle, Long> {
    List<HelpArticle> findByIsActiveTrueOrderBySortOrderAsc();
}
