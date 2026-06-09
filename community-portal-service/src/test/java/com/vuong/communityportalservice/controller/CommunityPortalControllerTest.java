package com.vuong.communityportalservice.controller;

import com.vuong.communityportalservice.dto.*;
import com.vuong.communityportalservice.enums.VoteType;
import com.vuong.communityportalservice.exception.CustomException;
import com.vuong.communityportalservice.service.CommentService;
import com.vuong.communityportalservice.service.PostService;
import com.vuong.communityportalservice.service.VoteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommunityPortalControllerTest {

    @Mock
    private PostService postService;

    @Mock
    private CommentService commentService;

    @Mock
    private VoteService voteService;

    @InjectMocks
    private CommunityPortalController communityPortalController;

    @Test
    void uploadFileReturnsUploadResponse() throws CustomException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "report.png",
                "image/png",
                "mock-content".getBytes()
        );
        UploadFileResponseDto uploadResponse = UploadFileResponseDto.builder()
                .fileName("report.png")
                .fileType("image/png")
                .filePath("/uploads/report.png")
                .fileSize(12L)
                .fileUrl("https://cdn.example.com/report.png")
                .build();

        when(postService.upload(file)).thenReturn(uploadResponse);

        ResponseEntity<?> response = communityPortalController.uploadFile(file);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(uploadResponse);
        verify(postService).upload(file);
    }

    @Test
    void createPostReturnsCreatedMessage() throws CustomException {
        PostDto postDto = new PostDto();
        postDto.setPostId(1L);
        postDto.setPostTitle("Healthy living");

        ResponseEntity<ResponseMessageDto> response = communityPortalController.createPost(postDto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(new ResponseMessageDto("Post created successfully", HttpStatus.CREATED));
        verify(postService).createPost(postDto);
    }

    @Test
    void getPostByIdReturnsPost() throws CustomException {
        PostDto postDto = new PostDto();
        postDto.setPostId(1L);
        postDto.setPostTitle("Healthy living");
        when(postService.getPostById(1L)).thenReturn(postDto);

        ResponseEntity<PostDto> response = communityPortalController.getPostById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(postDto);
    }

    @Test
    void getAllPostsReturnsPostList() throws CustomException {
        PostDto postDto = new PostDto();
        postDto.setPostId(1L);
        postDto.setPostTitle("Healthy living");
        when(postService.getAllPosts()).thenReturn(List.of(postDto));

        ResponseEntity<List<PostDto>> response = communityPortalController.getAllPosts();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(postDto);
    }

    @Test
    void updatePostReturnsSuccessMessage() throws CustomException {
        PostDto postDto = new PostDto();
        postDto.setPostId(1L);
        postDto.setPostTitle("Updated title");

        ResponseEntity<ResponseMessageDto> response = communityPortalController.updatePost(postDto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(new ResponseMessageDto("Post updated successfully", HttpStatus.OK));
        verify(postService).updatePost(postDto);
    }

    @Test
    void createCommentReturnsCreatedMessage() throws CustomException {
        CommentDto commentDto = new CommentDto();
        commentDto.setCommentId(10L);
        commentDto.setPostId(1L);

        ResponseEntity<ResponseMessageDto> response = communityPortalController.createComment(commentDto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(new ResponseMessageDto("Comment created successfully", HttpStatus.CREATED));
        verify(commentService).createComment(commentDto);
    }

    @Test
    void getCommentByIdReturnsComment() throws CustomException {
        CommentDto commentDto = new CommentDto();
        commentDto.setCommentId(10L);
        commentDto.setPostId(1L);
        when(commentService.getCommentById(10L)).thenReturn(commentDto);

        ResponseEntity<CommentDto> response = communityPortalController.getCommentById(10L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(commentDto);
    }

    @Test
    void getAllCommentsByPostIdReturnsCommentList() throws CustomException {
        CommentDto commentDto = new CommentDto();
        commentDto.setCommentId(10L);
        commentDto.setPostId(1L);
        when(commentService.getAllCommentsByPostId(1L)).thenReturn(List.of(commentDto));

        ResponseEntity<List<CommentDto>> response = communityPortalController.getAllCommentsByPostId(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(commentDto);
    }

    @Test
    void castVoteReturnsCreatedMessage() throws CustomException {
        VoteDto voteDto = VoteDto.builder()
                .voteId(100L)
                .patientId("PAT-1")
                .postId(1L)
                .voteType(VoteType.Upvote)
                .build();

        ResponseEntity<ResponseMessageDto> response = communityPortalController.castVote(voteDto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(new ResponseMessageDto("Voted successfully", HttpStatus.CREATED));
        verify(voteService).castVote(voteDto);
    }

    @Test
    void countVotesReturnsVoteCount() throws CustomException {
        VoteCountDto voteCountDto = VoteCountDto.builder()
                .postId(1L)
                .upVoteCount(4)
                .downVoteCount(1)
                .build();
        when(voteService.countVotes(1L)).thenReturn(voteCountDto);

        ResponseEntity<VoteCountDto> response = communityPortalController.countVotes(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(voteCountDto);
    }
}
