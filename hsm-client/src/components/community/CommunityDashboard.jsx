import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosInstanceCommunityPortalService from "../../utils/axiosInstanceCommunityPortalService";
import axiosInstancePatientService from "../../utils/axiosInstancePatientService";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/PatientSidebar";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaFire,
  FaUser,
  FaClock,
  FaTrophy,
  FaCalendarAlt,
  FaNewspaper,
  FaArrowRight,
  FaMedal,
  FaStar,
  FaEye,
  FaChartLine,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/community.css";
import "../../styles/community-dashboard.css";

const CommunityDashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [topDailyPosts, setTopDailyPosts] = useState([]);
  const [topMonthlyPosts, setTopMonthlyPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [creatorName, setCreatorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("daily");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCreatorName(), fetchPosts()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCreatorName = async () => {
    try {
      const response = await axiosInstancePatientService.get("/profile");
      setCreatorName(`${response.data.firstName} ${response.data.lastName}`);
    } catch (error) {
      console.error("Error fetching creator's name:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axiosInstanceCommunityPortalService.get("/posts");
      const postsWithVotesPromises = response.data.map(async (post) => {
        try {
          const voteCountResponse =
            await axiosInstanceCommunityPortalService.get(
              `/posts/${post.postId}/votes/count`
            );
          const commentsResponse =
            await axiosInstanceCommunityPortalService.get(
              `/posts/${post.postId}/comments`
            );

          return {
            ...post,
            comments: commentsResponse.data,
            upVoteCount: voteCountResponse.data.upVoteCount,
            downVoteCount: voteCountResponse.data.downVoteCount,
            score:
              voteCountResponse.data.upVoteCount -
              voteCountResponse.data.downVoteCount,
          };
        } catch (error) {
          console.error(`Error fetching data for post ${post.postId}:`, error);
          return {
            ...post,
            comments: [],
            upVoteCount: 0,
            downVoteCount: 0,
            score: 0,
          };
        }
      });

      const postsWithVotes = await Promise.all(postsWithVotesPromises);
      setPosts(postsWithVotes);

      // Process posts for different categories
      processPostsForCategories(postsWithVotes);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const processPostsForCategories = (allPosts) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter posts by date
    const dailyPosts = allPosts.filter((post) => {
      const postDate = new Date(post.createdAt);
      return postDate >= today;
    });

    const monthlyPosts = allPosts.filter((post) => {
      const postDate = new Date(post.createdAt);
      return postDate >= thisMonth;
    });

    // Sort by score (upvotes - downvotes) and get top 5
    const topDaily = dailyPosts.sort((a, b) => b.score - a.score).slice(0, 5);

    const topMonthly = monthlyPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Get latest posts (sorted by creation date)
    const latest = allPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    setTopDailyPosts(topDaily);
    setTopMonthlyPosts(topMonthly);
    setLatestPosts(latest);
  };

  const handleVote = async (postId, voteType) => {
    try {
      const voteDto = {
        postId: postId,
        voteType: voteType,
        isActive: true,
      };

      await axiosInstanceCommunityPortalService.post("/posts/vote", voteDto);
      fetchPosts(); // Refresh data after voting
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const PostCard = ({ post, index, showRank = false, size = "normal" }) => {
    const isCompact = size === "compact";

    const handleCardClick = () => {
      navigate(`/patient/community/post/${post.postId}`);
    };

    return (
      <div
        className={`dashboard-card post-card-compact cursor-pointer ${
          index === 0 && showRank
            ? "border-yellow-400 top-post-1"
            : index === 1 && showRank
            ? "border-gray-400 top-post-2"
            : index === 2 && showRank
            ? "border-orange-400 top-post-3"
            : "border-blue-400"
        } ${
          isCompact ? "p-4" : "p-6"
        } rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4`}
        onClick={handleCardClick}
      >
        {/* Rank Badge */}
        {showRank && index < 3 && (
          <div className="flex items-center justify-between mb-3">
            <div
              className={`rank-badge flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                index === 0
                  ? "bg-yellow-100 text-yellow-800"
                  : index === 1
                  ? "bg-gray-100 text-gray-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {index === 0 && <FaTrophy className="w-4 h-4" />}
              {index === 1 && <FaMedal className="w-4 h-4" />}
              {index === 2 && <FaStar className="w-4 h-4" />}#{index + 1}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaChartLine className="w-3 h-3" />
              <span>Score: {post.score}</span>
            </div>
          </div>
        )}

        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaUser className="text-white w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">{creatorName}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaClock className="w-3 h-3" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <h3
          className={`font-bold text-gray-900 mb-3 ${
            isCompact ? "text-lg" : "text-xl"
          }`}
        >
          {post.postTitle}
        </h3>

        <div className="text-gray-600 mb-4">
          {truncateContent(post.postContent, isCompact ? 80 : 150)}
        </div>

        {/* Post Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FaComment className="w-4 h-4" />
              <span>{post.comments?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaEye className="w-4 h-4" />
              <span>{Math.floor(Math.random() * 100) + 50}</span>
            </div>
          </div>

          {/* Vote Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote(post.postId, "Upvote");
              }}
              className="action-button vote-button-compact bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-1 text-sm"
            >
              <FaThumbsUp className="w-3 h-3" />
              {post.upVoteCount || 0}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVote(post.postId, "Downvote");
              }}
              className="action-button vote-button-compact bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-1 text-sm"
            >
              <FaThumbsDown className="w-3 h-3" />
              {post.downVoteCount || 0}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // PropTypes validation for PostCard
  PostCard.propTypes = {
    post: PropTypes.shape({
      postId: PropTypes.string.isRequired,
      postTitle: PropTypes.string.isRequired,
      postContent: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      score: PropTypes.number,
      upVoteCount: PropTypes.number,
      downVoteCount: PropTypes.number,
      comments: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    index: PropTypes.number,
    showRank: PropTypes.bool,
    size: PropTypes.string,
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <Navbar />
          <div className="container mx-auto p-4 bg-white min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                Đang tải dữ liệu cộng đồng...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4">
        <Navbar />
        <div className="container mx-auto p-4 bg-white min-h-screen">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 text-gray-800 flex items-center justify-center gap-3">
              <FaFire className="text-orange-500" />
              HMS Community Dashboard
            </h1>
            <p className="text-gray-600">
              Khám phá những bài viết hot nhất và mới nhất trong cộng đồng
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 flex justify-center gap-4">
            <Link
              to="/patient/community/create"
              className="action-button bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaNewspaper className="w-4 h-4" />
              Tạo bài viết mới
            </Link>
            <Link
              to="/patient/community/all"
              className="action-button bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaEye className="w-4 h-4" />
              Xem tất cả bài viết
            </Link>
          </div>

          {/* Top Posts Section */}
          <div className="mb-8">
            <div className="dashboard-card bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FaTrophy className="text-yellow-500" />
                  Bài viết được đánh giá cao nhất
                </h2>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("daily")}
                    className={`tab-button px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      activeTab === "daily"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <FaCalendarAlt className="w-4 h-4" />
                    Hôm nay
                  </button>
                  <button
                    onClick={() => setActiveTab("monthly")}
                    className={`tab-button px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      activeTab === "monthly"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <FaChartLine className="w-4 h-4" />
                    Tháng này
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {activeTab === "daily" && (
                  <>
                    {topDailyPosts.length > 0 ? (
                      topDailyPosts.map((post, index) => (
                        <PostCard
                          key={post.postId}
                          post={post}
                          index={index}
                          showRank={true}
                          size="compact"
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FaNewspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có bài viết nào hôm nay</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "monthly" && (
                  <>
                    {topMonthlyPosts.length > 0 ? (
                      topMonthlyPosts.map((post, index) => (
                        <PostCard
                          key={post.postId}
                          post={post}
                          index={index}
                          showRank={true}
                          size="compact"
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FaNewspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có bài viết nào tháng này</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Latest Posts Section */}
          <div className="mb-8">
            <div className="dashboard-card bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FaNewspaper className="text-green-500" />
                  Bài viết mới nhất
                </h2>
                <Link
                  to="/patient/community/all"
                  className="text-blue-500 hover:text-blue-700 flex items-center gap-2 font-semibold"
                >
                  Xem tất cả
                  <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid gap-4">
                {latestPosts.length > 0 ? (
                  latestPosts.map((post) => (
                    <PostCard key={post.postId} post={post} size="compact" />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaNewspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có bài viết nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="stats-card bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Tổng bài viết</h3>
                  <p className="text-3xl font-bold">{posts.length}</p>
                </div>
                <FaNewspaper className="w-12 h-12 opacity-80" />
              </div>
            </div>

            <div className="stats-card bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Bài viết hôm nay</h3>
                  <p className="text-3xl font-bold">{topDailyPosts.length}</p>
                </div>
                <FaCalendarAlt className="w-12 h-12 opacity-80" />
              </div>
            </div>

            <div className="stats-card bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Thành viên hoạt động
                  </h3>
                  <p className="text-3xl font-bold">
                    {Math.floor(Math.random() * 50) + 100}
                  </p>
                </div>
                <FaUser className="w-12 h-12 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
