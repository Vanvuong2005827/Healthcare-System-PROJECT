package com.vuong.communityportalservice.controller;

import com.vuong.communityportalservice.dto.ArticleCommentDto;
import com.vuong.communityportalservice.dto.ArticleDto;
import com.vuong.communityportalservice.dto.ResponseMessageDto;
import com.vuong.communityportalservice.enums.ArticleCategory;
import com.vuong.communityportalservice.enums.ArticleActorType;
import com.vuong.communityportalservice.enums.VoteType;
import com.vuong.communityportalservice.exception.CustomException;
import com.vuong.communityportalservice.service.ArticleBookmarkService;
import com.vuong.communityportalservice.service.ArticleCommentService;
import com.vuong.communityportalservice.service.ArticleLikeService;
import com.vuong.communityportalservice.service.ArticleService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArticleControllerTest {

    @Mock
    private ArticleService articleService;

    @Mock
    private ArticleLikeService articleLikeService;

    @Mock
    private ArticleBookmarkService articleBookmarkService;

    @Mock
    private ArticleCommentService articleCommentService;

    @InjectMocks
    private ArticleController articleController;

    @Test
    void createArticleReturnsCreatedArticle() throws CustomException {
        ArticleDto articleDto = articleDto(1L, "DOC-1", "Healthy heart");
        when(articleService.createArticle(articleDto)).thenReturn(articleDto);

        ResponseEntity<ArticleDto> response = articleController.createArticle(articleDto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(articleDto);
    }

    @Test
    void updateArticleReturnsUpdatedArticle() throws CustomException {
        ArticleDto articleDto = articleDto(1L, "DOC-1", "Updated title");
        when(articleService.updateArticle(articleDto)).thenReturn(articleDto);

        ResponseEntity<ArticleDto> response = articleController.updateArticle(articleDto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(articleDto);
    }

    @Test
    void deleteArticleReturnsSuccessMessage() throws CustomException {
        ResponseEntity<ResponseMessageDto> response = articleController.deleteArticle(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(new ResponseMessageDto("Article deleted successfully", HttpStatus.OK));
        verify(articleService).deleteArticle(1L);
    }

    @Test
    void getArticleByIdReturnsArticle() throws CustomException {
        ArticleDto articleDto = articleDto(1L, "DOC-1", "Healthy heart");
        when(articleService.getArticleById(1L)).thenReturn(articleDto);

        ResponseEntity<ArticleDto> response = articleController.getArticleById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(articleDto);
    }

    @Test
    void getAllArticlesReturnsArticleList() throws CustomException {
        ArticleDto articleDto = articleDto(1L, "DOC-1", "Healthy heart");
        when(articleService.getAllArticles()).thenReturn(List.of(articleDto));

        ResponseEntity<List<ArticleDto>> response = articleController.getAllArticles();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(articleDto);
    }

    @Test
    void getArticlesByCategoryReturnsArticleList() throws CustomException {
        ArticleDto articleDto = articleDto(1L, "DOC-1", "Healthy heart");
        when(articleService.getArticlesByCategory(ArticleCategory.DISEASE)).thenReturn(List.of(articleDto));

        ResponseEntity<List<ArticleDto>> response = articleController.getArticlesByCategory(ArticleCategory.DISEASE);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(articleDto);
    }

    @Test
    void getArticlesByDoctorReturnsArticleList() throws CustomException {
        ArticleDto articleDto = articleDto(1L, "DOC-1", "Healthy heart");
        when(articleService.getArticlesByDoctor("DOC-1")).thenReturn(List.of(articleDto));

        ResponseEntity<List<ArticleDto>> response = articleController.getArticlesByDoctor("DOC-1");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(articleDto);
    }

    @Test
    void searchArticlesReturnsArticleList() throws CustomException {
        ArticleDto articleDto = articleDto(1L, "DOC-1", "Healthy heart");
        when(articleService.searchArticles("heart")).thenReturn(List.of(articleDto));

        ResponseEntity<List<ArticleDto>> response = articleController.searchArticles("heart");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(articleDto);
    }

    @Test
    void toggleLikeReturnsLikeStateAndCount() throws CustomException {
        when(articleLikeService.toggleLike(1L)).thenReturn(true);
        when(articleLikeService.getLikeCount(1L)).thenReturn(7L);

        ResponseEntity<Map<String, Object>> response = articleController.toggleLike(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("liked", true).containsEntry("likeCount", 7L);
        verify(articleLikeService).toggleLike(1L);
        verify(articleLikeService).getLikeCount(1L);
    }

    @Test
    void toggleBookmarkReturnsBookmarkState() throws CustomException {
        when(articleBookmarkService.toggleBookmark(1L)).thenReturn(true);

        ResponseEntity<Map<String, Object>> response = articleController.toggleBookmark(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("bookmarked", true);
        verify(articleBookmarkService).toggleBookmark(1L);
    }

    @Test
    void getMyBookmarksReturnsBookmarkList() throws CustomException {
        ArticleDto articleDto = articleDto(1L, "DOC-1", "Healthy heart");
        when(articleBookmarkService.getBookmarkedArticles()).thenReturn(List.of(articleDto));

        ResponseEntity<List<ArticleDto>> response = articleController.getMyBookmarks();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(articleDto);
    }

    @Test
    void createCommentReturnsCreatedComment() throws CustomException {
        ArticleCommentDto commentDto = articleCommentDto(10L, 1L, "PAT-1", "Great article");
        when(articleCommentService.createComment(commentDto)).thenReturn(commentDto);

        ResponseEntity<ArticleCommentDto> response = articleController.createComment(commentDto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(commentDto);
    }

    @Test
    void getCommentsByArticleReturnsCommentList() throws CustomException {
        ArticleCommentDto commentDto = articleCommentDto(10L, 1L, "PAT-1", "Great article");
        when(articleCommentService.getCommentsByArticle(1L)).thenReturn(List.of(commentDto));

        ResponseEntity<List<ArticleCommentDto>> response = articleController.getCommentsByArticle(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(commentDto);
    }

    @Test
    void deleteCommentReturnsSuccessMessage() throws CustomException {
        ResponseEntity<ResponseMessageDto> response = articleController.deleteComment(10L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(new ResponseMessageDto("Comment deleted successfully", HttpStatus.OK));
        verify(articleCommentService).deleteComment(10L);
    }

    private ArticleDto articleDto(Long articleId, String doctorId, String title) {
        ArticleDto articleDto = new ArticleDto();
        articleDto.setArticleId(articleId);
        articleDto.setDoctorId(doctorId);
        articleDto.setDoctorName("Dr. John Smith");
        articleDto.setDoctorDepartment("Cardiology");
        articleDto.setTitle(title);
        articleDto.setContent("Content");
        articleDto.setCategory(ArticleCategory.DISEASE);
        articleDto.setThumbnailUrl("https://cdn.example.com/article.png");
        articleDto.setCreatedAt(LocalDateTime.of(2026, 6, 9, 10, 0));
        articleDto.setUpdatedAt(LocalDateTime.of(2026, 6, 9, 11, 0));
        articleDto.setLikeCount(5L);
        articleDto.setLikedByCurrentUser(true);
        articleDto.setBookmarkedByCurrentUser(false);
        articleDto.setCommentCount(2L);
        return articleDto;
    }

    private ArticleCommentDto articleCommentDto(Long commentId, Long articleId, String actorId, String content) {
        ArticleCommentDto commentDto = new ArticleCommentDto();
        commentDto.setCommentId(commentId);
        commentDto.setArticleId(articleId);
        commentDto.setActorId(actorId);
        commentDto.setActorName("Patient One");
        commentDto.setActorType(ArticleActorType.PATIENT);
        commentDto.setContent(content);
        commentDto.setCreatedAt(LocalDateTime.of(2026, 6, 9, 10, 15));
        return commentDto;
    }
}
