const express = require('express');
const multer = require('multer');
const fs = require('fs');
const db = require('../../models/db.js'); // db 모듈 가져오기

// Multer 설정
const storage = multer.memoryStorage(); // 이미지를 메모리에 저장
const upload = multer({ storage: storage });

const router = express.Router();

// /main 페이지에서 세션 확인하여 닉네임 정보 사용
router.get('/checkSession', (req, res) => {
    // 세션에 저장된 값 확인
    const user_id = req.session.user_id;
    const nickname = req.session.nickname;
    const email = req.session.email;
    res.json({ nickname, email, user_id });
});

// 로그인 후 사용자 정보를 클라이언트에 제공
router.get('/api/userinfo', (req, res) => {
    if (req.session && req.session.nickname) {
        const user_id = req.session.nickname;
        // 필요한 사용자 정보를 데이터베이스에서 가져오는 로직 추가
        db.query('SELECT * FROM User WHERE ID = ?', [user_id], (error, results) => {
            if (error) {
                console.error('사용자 정보 조회 중 오류:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                const user = results[0];
                res.json({ user_idx: user.idx });
            }
        });
    } else {
        res.status(401).json({ error: '로그인이 필요합니다.' });
    }
});

// user_idx로 사용자 정보 호출 api
router.get('/api/user/:userIdx', (req, res) => {
    const userIdx = req.params.userIdx;

    // 필요한 사용자 정보를 데이터베이스에서 가져오는 로직 추가
    db.query('SELECT * FROM User WHERE idx = ?', [userIdx], (error, results) => {
        if (error) {
            console.error('사용자 정보 조회 중 오류:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const user = results[0];
            res.json({ user });
        }
    });
});

// 유저 닉네임으로 idx 찾는 함수
router.get('/api/userID/:userID', (req, res) => {
    const userID = req.params.userID;

    // 필요한 사용자 정보를 데이터베이스에서 가져오는 로직 추가
    db.query('SELECT * FROM User WHERE ID = ?', [userID], (error, results) => {
        if (error) {
            console.error('사용자 정보 조회 중 오류:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const user = results[0];
            res.json({ user });
        }
    });
});

// profile 페이지 이동
router.get('/profile/:nickname', (req, res) => {
    const nickname = req.params.nickname;
    let myPage;
    let follow;

    if (nickname === req.session.nickname) {
        myPage = true;
    } else {
        myPage = false;

        getUserIdx(req.session.nickname, (error, myidx) => {
            if (error) {
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            getUserIdx(req.params.nickname, (error, followidx) => {
                if (error) {
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }

                isFollowing(myidx, followidx, (error, result) => {
                    if (error) {
                        console.error('팔로우 여부 확인 중 오류:', error);
                        // 오류 처리 로직 추가
                        return;
                    }

                    if (result) {
                        // 이미 팔로우 중인 경우의 처리 로직 추가
                        follow = true;
                    } else {
                        // 팔로우하지 않은 경우의 처리 로직 추가
                        follow = false;
                    }
                });
            });
        });
    }

    db.query('SELECT * FROM User WHERE ID = ?', [nickname], (error, userResults) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (userResults.length > 0) {
            const user = userResults[0];

            // 사용자의 게시물 수 조회
            db.query('SELECT COUNT(*) AS postCount FROM posts WHERE user_idx = ?', [user.idx], (error, countResults) => {
                if (error) {
                    console.error(error);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                const postCount = countResults[0].postCount;

                // 팔로우 수 조회
                db.query('SELECT COUNT(*) AS followerCount FROM Follow WHERE following_id = ?', [user.idx], (followerError, followerResults) => {
                    if (followerError) {
                        console.error(followerError);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    const followerCount = followerResults[0].followerCount;

                    // 팔로워 수 조회
                    db.query('SELECT COUNT(*) AS followingCount FROM Follow WHERE follower_id = ?', [user.idx], (followingError, followingResults) => {
                        if (followingError) {
                            console.error(followingError);
                            res.status(500).send('Internal Server Error');
                            return;
                        }

                        const followingCount = followingResults[0].followingCount;

                        // 사용자의 게시물을 조회
                        db.query('SELECT * FROM posts WHERE user_idx = ? ORDER BY created_at DESC;', [user.idx], (error, postResults) => {
                            if (error) {
                                console.error(error);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            const userName = nickname;
                            const condition = postResults.length > 0; // 게시물이 있는 경우 true, 없는 경우 false
                            res.render('profile', {
                                userName,
                                condition,
                                postCount,
                                followerCount,
                                followingCount,
                                posts: postResults,
                                myPage: myPage,
                                follow: follow
                            });
                        });
                    });
                });
            });
        } else {
            // 사용자가 존재하지 않는 경우
            res.status(404).send('User Not Found');
        }
    });
});

// POST 라우트 - 게시물 업로드
router.post('/api/posts', upload.single('image'), (req, res) => {
    const { user_idx, text } = req.body;

    // Check if a file is uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const image_data = req.file.buffer; // 이미지 데이터

    // 데이터베이스에 게시물 저장
    const query = 'INSERT INTO posts (user_idx, content, image_data) VALUES (?, ?, ?)';
    const values = [user_idx, text, image_data];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error('게시물 업로드 중 데이터베이스 오류:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({ success: true, postId: results.insertId });
    });
});

// 팔로우 추가 엔드포인트
router.post('/api/follow', (req, res) => {
    const { followUserId, myUserId } = req.body;

    getUserIdx(followUserId, (error, followUserIdx) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // 자기 자신을 팔로우하는지 확인
        if (myUserId === followUserIdx) {
            res.status(400).json({ error: '자기 자신을 팔로우할 수 없습니다.' });
            return;
        }

        // 이후에 followUserIdx를 사용하여 팔로우 관계를 추가하는 로직 수행
        const addFollowQuery = 'INSERT INTO Follow (follower_id, following_id) VALUES (?, ?)';
        db.query(addFollowQuery, [myUserId, followUserIdx], (addFollowError) => {
            if (addFollowError) {
                console.error('팔로우 추가 중 오류:', addFollowError);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            console.log('팔로우 성공');
            res.json({ success: true });
        });
    });
});

// 언팔로우 API
router.post('/api/unfollow', (req, res) => {
    const { unfollowUserId, myUserId } = req.body;

    getUserIdx(unfollowUserId, (error, unfollowUserIdx) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // 이후에 unfollowUserIdx를 사용하여 언팔로우 관계를 삭제하는 로직 수행
        const removeFollowQuery = 'DELETE FROM Follow WHERE follower_id = ? AND following_id = ?';
        db.query(removeFollowQuery, [myUserId, unfollowUserIdx], (removeFollowError) => {
            if (removeFollowError) {
                console.error('언팔로우 중 오류:', removeFollowError);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json({ success: true });
        });
    });
});

// 팔로워 삭제 (나를 팔로우 한 사람을 삭제하는것) API
router.post('/api/deletefollow', (req, res) => {
    const { unfollowUserId, myUserId } = req.body;

    getUserIdx(unfollowUserId, (error, unfollowUserIdx) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // 이후에 unfollowUserIdx를 사용하여 언팔로우 관계를 삭제하는 로직 수행
        const removeFollowQuery = 'DELETE FROM Follow WHERE follower_id = ? AND following_id = ?';
        db.query(removeFollowQuery, [unfollowUserIdx, myUserId], (removeFollowError) => {
            if (removeFollowError) {
                console.error('언팔로우 중 오류:', removeFollowError);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            console.log('팔로워 삭제 성공');
            res.json({ success: true });
        });
    });
});

// 유저 ID를 통해서 유저 idx 가져오는 함수
function getUserIdx(username, callback) {
    const followUserQuery = 'SELECT idx FROM User WHERE ID = ?';
    db.query(followUserQuery, [username], (followUserError, followUserResult) => {
        if (followUserError) {
            console.error('Follow 대상 조회 중 오류:', followUserError);
            callback(followUserError, null);
            return;
        }
        if (followUserResult && followUserResult.length > 0) {
            const followUserIdx = followUserResult[0].idx;
            callback(null, followUserIdx);
        } else {
            console.log('팔로우 대상이 존재하지 않습니다.');
        }
    });
}

// 팔로우 여부 확인하는 함수
function isFollowing(myUserId, followUserId, callback) {
    // 팔로우 여부를 확인하는 쿼리
    const checkFollowQuery = 'SELECT * FROM Follow WHERE follower_id = ? AND following_id = ?';

    db.query(checkFollowQuery, [myUserId, followUserId], (error, results) => {
        if (error) {
            console.error('팔로우 여부 확인 중 오류:', error);
            callback(error, null);
            return;
        }

        // results 배열이 비어있다면 언팔로우 상태, 그렇지 않다면 팔로우 상태
        const isFollowing = results.length > 0;
        callback(null, isFollowing);
    });
}

// 팔로우 여부 확인하는 api
router.get('/isFollowing/:username', (req, res) => {
    const myUserId = req.session.user_id; // 현재 로그인한 사용자의 ID를 얻는 방법은 프로젝트에 따라 다를 수 있습니다.
    const followUsername = req.params.username;

    // 팔로우 여부 확인 함수 호출
    isFollowing(myUserId, followUsername, (error, result) => {
        if (error) {
            console.error('팔로우 여부 확인 중 오류:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            res.status(200).json({ isFollowing: result });
        }
    });
});

// 포스터 정보 및 유저 정보 가져오는 api
router.get('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId;
    const visitUserId = req.session.user_id;

    const postLoadQuery = 'SELECT * FROM posts WHERE post_id = ?';
    const userLoadQuery = 'SELECT * FROM User WHERE idx = ?';
    const likeCheckQuery = 'SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ? AND user_id = ?';
    const likeInfoQuery = 'SELECT user_id FROM likes WHERE post_id = ?';

    db.query(postLoadQuery, [postId], (error, postResults) => {
        if (error) {
            console.error('포스트 불러 오는 중 오류: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (postResults.length === 0) {
            // 해당 postId에 대한 포스트가 없을 경우
            res.status(404).json({ error: 'Post not found' });
        } else {
            // 해당 postId에 대한 포스트를 찾았을 경우
            const post = postResults[0];

            db.query(userLoadQuery, [post.user_idx], (error, userResults) => {
                if (error) {
                    console.error('유저 정보 불러 오는 중 오류: ', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }

                if (userResults.length === 0) {
                    res.status(404).json({ error: 'User not found' });
                } else {
                    const user = userResults[0];

                    // 좋아요 여부 확인
                    db.query(likeCheckQuery, [postId, visitUserId], (error, likeResults) => {
                        if (error) {
                            console.error('좋아요 확인 중 오류: ', error);
                            res.status(500).json({ error: 'Internal Server Error' });
                            return;
                        }

                        const isLiked = likeResults[0].likeCount > 0;

                        // 좋아요 정보 가져오기
                        db.query(likeInfoQuery, [postId], (error, likeInfoResults) => {
                            if (error) {
                                console.error('좋아요 정보 불러 오는 중 오류: ', error);
                                res.status(500).json({ error: 'Internal Server Error' });
                                return;
                            }

                            const likeCount = likeInfoResults.length;
                            const likedUserIds = likeInfoResults.map(like => like.user_id);

                            // 포스트 정보, 유저 정보, 좋아요 여부, 좋아요 갯수, 좋아요 누른 사용자들의 ID를 함께 응답
                            res.json({ post, user, isLiked, likeCount, likedUserIds });
                        });
                    });
                }
            });
        }
    });
});

// 댓글 업로드 API
router.post('/api/comments', (req, res) => {
    const { postid, useridx, content } = req.body;

    // TODO: 댓글을 DB에 저장하는 쿼리 실행
    const insertCommentQuery = 'INSERT INTO comment (post_id, user_idx, content) VALUES (?, ?, ?)';

    db.query(insertCommentQuery, [postid, useridx, content], (error, results) => {
        if (error) {
            console.error('댓글 업로드 중 오류:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('댓글이 성공적으로 업로드되었습니다.');
            res.status(200).json({ success: true });
        }
    });
});

// 포스트에 속한 댓글 가져오기 API
router.get('/api/comments/:postId', (req, res) => {
    const postId = req.params.postId;

    // TODO: 해당 포스트에 속한 댓글을 가져오는 쿼리 실행
    const getCommentsQuery = 'SELECT * FROM comment WHERE post_id = ?';

    db.query(getCommentsQuery, [postId], (error, results) => {
        if (error) {
            console.error('댓글 가져오기 중 오류:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ success: true, comments: results });
        }
    });
});

// 포스트 좋아요 api 함수
router.post('/api/like', (req, res) => {
    const { postId, user_idx } = req.body;

    // 좋아요를 이미 눌렀는지 여부를 확인
    const checkLikeQuery = 'SELECT * FROM likes WHERE post_id = ? AND user_id = ?';

    db.query(checkLikeQuery, [postId, user_idx], (error, results) => {
        if (error) {
            console.error('좋아요 확인 중 오류:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (results.length > 0) {
                // 이미 좋아요를 눌렀다면 해당 좋아요 데이터 삭제
                const deleteLikeQuery = 'DELETE FROM likes WHERE post_id = ? AND user_id = ?';

                db.query(deleteLikeQuery, [postId, user_idx], (deleteError, deleteResults) => {
                    if (deleteError) {
                        console.error('좋아요 삭제 중 오류:', deleteError);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        console.log('좋아요가 성공적으로 삭제되었습니다.');
                        res.status(200).json({ success: true, isLiked: false });
                    }
                });
            } else {
                // 좋아요를 누르지 않은 경우 좋아요 데이터 추가
                const addLikeQuery = 'INSERT INTO likes (post_id, user_id) VALUES (?, ?)';

                db.query(addLikeQuery, [postId, user_idx], (addError, addResults) => {
                    if (addError) {
                        console.error('좋아요 추가 중 오류:', addError);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        console.log('좋아요가 성공적으로 추가되었습니다.');
                        res.status(200).json({ success: true, isLiked: true });
                    }
                });
            }
        }
    });
});


router.post('/followList', (req, res) => {
    const { user_idx } = req.body;

    // 팔로우 리스트 가져오기 쿼리
    const getFollowListQuery = 'SELECT following_id FROM Follow WHERE follower_id = ?';
    db.query(getFollowListQuery, [user_idx], (error, followResults, fields) => {
        if (error) {
            console.error('팔로우 리스트 가져오기 쿼리 오류:', error);
            res.status(500).send('Internal Server Error');
        } else {
            // 팔로우 리스트 가져오기 성공
            const followList = followResults.map(result => result.following_id);

            if (followList.length === 0) {
                // 만약 팔로우 리스트가 비어 있다면 해당 정보가 없다는 메시지를 클라이언트에 전송
                res.status(200).json({ message: '해당 사용자의 팔로우가 없습니다.' });
                return;
            }

            // 해당 사용자 정보 가져오기 쿼리
            const getUserInfoQuery = 'SELECT idx, ID FROM User WHERE idx IN (?)';
            db.query(getUserInfoQuery, [followList], (error, userResults, fields) => {
                if (error) {
                    console.error('사용자 정보 가져오기 쿼리 오류:', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    // 사용자 정보 가져오기 성공
                    const userList = userResults.map(user => ({
                        idx: user.idx,
                        ID: user.ID
                    }));

                    // 클라이언트에 응답으로 팔로우한 사용자들의 정보를 보냅니다.
                    res.status(200).json({ userList });
                }
            });
        }
    });
});

router.post('/followerList', (req, res) => {
    const { user_idx } = req.body;
    const getFollowListQuery = 'SELECT follower_id FROM Follow WHERE following_id = ?';

    db.query(getFollowListQuery, [user_idx], (error, followResults, fields) => {
        if (error) {
            console.error('팔로우 리스트 가져오기 쿼리 오류:', error);
            res.status(500).send('Internal Server Error');
        } else {
            // 팔로우 리스트 가져오기 성공
            const followerList = followResults.map(result => result.follower_id);

            if (followerList.length === 0) {
                // 만약 팔로워 리스트가 비어 있다면 해당 정보가 없다는 메시지를 클라이언트에 전송
                res.status(200).json({ message: '해당 사용자의 팔로워가 없습니다.' });
                return;
            }

            // 해당 사용자 정보 가져오기 쿼리
            const getUserInfoQuery = 'SELECT idx, ID FROM User WHERE idx IN (?)';
            db.query(getUserInfoQuery, [followerList], (error, userResults, fields) => {
                if (error) {
                    console.error('사용자 정보 가져오기 쿼리 오류:', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    // 사용자 정보 가져오기 성공
                    const userList = userResults.map(user => ({
                        idx: user.idx,
                        ID: user.ID
                    }));

                    // 클라이언트에 응답으로 팔로우한 사용자들의 정보를 보냅니다.
                    res.status(200).json({ userList });
                }
            });
        }
    });
});

module.exports = router;