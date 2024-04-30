// apiRequests.js 파일

// 회원가입 요청
export async function registerUser(userData) {
    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    if (response.ok) {
        window.location.href = '/index';
        alert("회원가입 완료");
        return response.json();
    } else {
        return response.json().then(error => {
            alert(error.error);
            throw new Error(error.error);
        });
    }
}

// 로그인 요청
export async function loginUser(userData) {
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message); // 로그인 성공 메시지
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl; // 리다이렉트
            }
        } else if (response.status === 401) {
            const errorData = await response.json();
            alert("비밀번호가 일치하지 않습니다.");
            console.log(errorData.error); // 비밀번호 불일치 오류 메시지
        } else if (response.status === 404) {
            const errorData = await response.json();
            alert("존재하지 않는 이메일 입니다.");
            console.log(errorData.error); // 사용자를 찾을 수 없음 오류 메시지
        } else {
            throw new Error('서버 오류 발생');
        }
    } catch (error) {
        console.error(error);
        // 예외 처리: 서버 오류 등
    }
}

// 클라이언트에서 서버의 /checkSession 엔드포인트 호출
export async function checkSession() {
    try {
        const response = await fetch('/checkSession');
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            console.error('세션 확인 중 오류 발생');
            return {}; // 오류 시 빈 객체 반환 또는 다른 기본값 반환
        }
    } catch (error) {
        console.error(error);
        return {}; // 오류 시 빈 객체 반환 또는 다른 기본값 반환
    }
}

// 클라이언트 사이드 JavaScript
export function profileUser(nickname) {
    fetch(`/profile/${nickname}`)
        .then(response => {
            if (response.ok) {
                window.location.href = `/profile/${nickname}`; // 페이지 이동
            } else {
                window.location.href = `/main`; // 페이지 이동
            }
            throw new Error('프로필을 가져오는 데 문제가 발생했습니다.');
        })
        .then(profileHTML => {
            // 받아온 HTML을 어떻게 사용할지는 여기에서 처리
            // 예: 받아온 HTML을 어딘가에 삽입하여 사용자에게 표시
        })
        .catch(error => {
            console.error(error);
            // 오류 처리
        });
}

// 게시물 업로드 api 요청 함수
export function saveDataToDatabase(formData) {
    fetch('/api/posts', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            console.log('게시물이 성공적으로 업로드되었습니다.', data);
            $('#staticBackdrop').modal('hide'); // 모달 숨기기
            alert("게시물 업로드 완료");
            // 필요한 로직 추가
            location.reload(true);
        })
        .catch(error => {
            console.error('게시물 업로드 중 오류 발생:', error);
        });
}

// 사용자 idx 가져오는 함수
export async function getUserInfo() {
    try {
        const response = await fetch('/api/userinfo');
        const data = await response.json();

        // data에는 user_id와 기타 사용자 정보가 들어있음
        const user_idx = data.user_idx;

        return user_idx;
    } catch (error) {
        console.error('사용자 정보 조회 중 오류:', error);
        return null;
    }
}

// user_idx 로 사용자 정보 가져오는 함수
export function getUser(userIdx) {
    return fetch(`/api/user/${userIdx}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('사용자 정보를 가져오는 데 문제가 발생했습니다.');
            }
        })
        .then(userInfo => {
            return userInfo.user.ID;
        })
        .catch(error => {
            console.error(error);
        });
}

// 유저 닉네임으로 idx 얻어 오는 함수
export function getUserIdx(userID) {
    return fetch(`/api/userID/${userID}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('사용자 정보를 가져오는 데 문제가 발생했습니다.');
            }
        })
        .then(userInfo => {
            return userInfo.user.idx;
        })
        .catch(error => {
            console.error(error);
        });
}


// 팔로우 api 요청 함수
export async function followUser(decodedUserId) {
    try {
        const myUserId = await getUserInfo(); // await를 사용하여 비동기 함수 실행을 대기
        const followUserId = decodedUserId;
        console.log(myUserId, followUserId);

        // 서버로 팔로우 요청을 보냄
        const response = await fetch('/api/follow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ followUserId, myUserId }), // myUserId를 함께 보내기
        });

        const data = await response.json();

        if (data.success) {
            console.log('팔로우가 성공적으로 추가되었습니다.');
            // 필요한 로직 추가
            location.reload(true);
        } else {
            console.error('팔로우 추가 중 오류 발생:', data.error);
            // 오류 처리 로직 추가
        }
    } catch (error) {
        console.error('팔로우 요청 중 오류:', error);
        // 오류 처리 로직 추가
    }
}

// 언팔로우 api 요청 함수
export async function unfollowUser(decodedUserId) {
    try {
        const myUserId = await getUserInfo(); // await를 사용하여 비동기 함수 실행을 대기
        const unfollowUserId = decodedUserId;
        console.log(myUserId, unfollowUserId);

        // 서버로 언팔로우 요청을 보냄
        const response = await fetch('/api/unfollow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ unfollowUserId, myUserId }), // myUserId를 함께 보내기
        });

        const data = await response.json();

        if (data.success) {
            console.log('언팔로우가 성공적으로 수행되었습니다.');
            // 필요한 로직 추가
            location.reload(true);
        } else {
            console.error('언팔로우 중 오류 발생:', data.error);
            // 오류 처리 로직 추가
        }
    } catch (error) {
        console.error('언팔로우 요청 중 오류:', error);
        // 오류 처리 로직 추가
    }
}

// 팔로워 삭제 api 요청 함수
export async function deletefollowwerUser(decodedUserId) {
    try {
        const myUserId = await getUserInfo(); // await를 사용하여 비동기 함수 실행을 대기
        const unfollowUserId = decodedUserId;

        // 서버로 언팔로우 요청을 보냄
        const response = await fetch('/api/deletefollow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ unfollowUserId, myUserId }), // myUserId를 함께 보내기
        });

        const data = await response.json();

        if (data.success) {
            console.log('팔로워 삭제가 성공적으로 수행되었습니다.');
            // 필요한 로직 추가
            location.reload(true);
        } else {
            console.error('팔로워 삭제중 오류 발생:', data.error);
            // 오류 처리 로직 추가
        }
    } catch (error) {
        console.error('팔로워 삭제요청 중 오류:', error);
        // 오류 처리 로직 추가
    }
}

// 포스트 데이터 호출 하는 함수
export async function postLoad(postId, callback) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        const data = await response.json();

        // 데이터 로드 완료 후 콜백 호출
        callback(null, data);
    } catch (error) {
        // 오류 발생 시 콜백 호출
        callback(error, null);
    }
}

// 댓글 업로드 호출 함수
export async function commentUpload(postid, useridx, content) {
    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                postid,
                useridx,
                content: content,
            }),
        });

        if (response.ok) {
            console.log('댓글이 성공적으로 업로드되었습니다.');
            // 여기서 원하는 작업 수행 (예: 모달 닫기 등)
        } else {
            console.error('댓글 업로드 중 오류 발생:', response.statusText);
        }
    } catch (error) {
        console.error('댓글 업로드 중 예외 발생:', error);
    }
}

// 댓글 데이터 호출 하는 함수
export async function getComments(postId, callback) {
    try {
        const response = await fetch(`/api/comments/${postId}`);
        const data = await response.json();

        if (response.ok) {
            callback(null, data.comments);
        } else {
            console.error('댓글 가져오기 중 오류 발생:', data.error);
            callback(data.error, null);
        }
    } catch (error) {
        console.error('댓글 가져오기 중 예외 발생:', error);
        callback(error, null);
    }
}

export function likePost(postId, user_idx) {
    const likeData = {
        postId: postId,
        user_idx: user_idx
    };

    fetch('/api/like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(likeData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            console.log('포스트 좋아요 성공:', data);
            // 서버로부터 받은 isLiked 값에 따라 동적으로 UI 업데이트
            const isLiked = data.isLiked;
            updateLikeUI(isLiked);
        })
        .catch(error => {
            console.error('포스트 좋아요 오류:', error);
            // 에러 처리
        });

    function updateLikeUI(isLiked) {
        const likeBtn = document.querySelector(".like");
        const likePath = likeBtn.querySelector("path");

        if (isLiked) {
            // SVG path의 fill 속성 변경
            likePath.setAttribute('fill', 'red'); // 내부 path 속성 변경
            likeBtn.setAttribute('fill', 'red'); // 부모 svg의 fill 속성 변경
            likePath.setAttribute('d', 'M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z');
            likeBtn.setAttribute('viewBox', '0 0 48 48');
        } else {
            // SVG path의 fill 속성 변경
            likePath.setAttribute('fill', 'black'); // 내부 path 속성 변경
            likeBtn.setAttribute('fill', 'black'); // 부모 svg의 fill 속성 변경
            likePath.setAttribute('d', 'M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z');
            likeBtn.setAttribute('viewBox', '0 0 24 24');
        }
    }
}

export async function followList() {
    const url = window.location.href;
    const parts = url.split('/');
    const user_id = parts[parts.length - 1];
    const user_idx = await getUserIdx(user_id);

    fetch('/followList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_idx }) // 객체 형태로 변경
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            if ('message' in data) {
                // 만약 메시지 속성이 있다면, 즉, 팔로워 리스트가 비어 있다면 해당 메시지를 처리
                console.log('메시지:', data.message);
                const modalBody = document.querySelector('.modal-body .search-list');
                modalBody.innerHTML = '';
            } else {
                // 팔로워 리스트가 비어 있지 않다면 사용자 ID를 추출하여 모달에 삽입
                const userIDs = data.userList.map(user => user.ID);
                insertUsersIntoModal(userIDs);
            }
        })
        .catch(error => {
            console.error('팔로우 리스트 가져오기 오류:', error);
            // 에러 처리
        });

    function insertUsersIntoModal(userIDs) {
        const modalBody = document.querySelector('.modal-body .search-list');

        // 기존에 있는 사용자 정보 제거
        modalBody.innerHTML = '';

        // 사용자 정보를 모달에 동적으로 추가
        userIDs.forEach(userID => {
            const profileImagePath = '../img/porfile.jpeg';
            const userName = userID;
            const userHTML = `
                    <div class="content-wrapper">
                        <img src="${profileImagePath}" style="width: 40px; height: 40px;">
                        <a href="/profile/${userName}" style="font-size: 14px; font-weight: 700; 
                        text-decoration: none; color: black;">${userName}</a>
                        <div class="following-list-btn" style="font-size: 14px; color: #0095F6; margin-left: auto;">팔로잉</div>
                    </div>
                `;


            modalBody.insertAdjacentHTML('beforeend', userHTML);
        });

        // 삭제 버튼에 대한 이벤트 리스너 추가
        const deleteButtons = modalBody.querySelectorAll('.following-list-btn');

        deleteButtons.forEach(deleteButton => {
            deleteButton.addEventListener('click', () => {
                // 부모 요소에서 사용자 이름 가져오기
                const userName = deleteButton.closest('.content-wrapper').querySelector('a').textContent;

                // 사용자에게 확인 메시지를 보여줌
                const confirmUnfollow = window.confirm(`정말 ${userName}님을 언팔로우 하시겠습니까?`);

                if (confirmUnfollow) {
                    // 확인이 눌렸을 때 언팔로우 로직을 수행하는 함수 호출
                    console.log(userName);
                    // unfollowUser 함수에 userName 전달
                    unfollowUser(userName);
                }
            });
        });
    }
}


export async function followerList() {
    const url = window.location.href;
    const parts = url.split('/');
    const user_id = parts[parts.length - 1];
    const user_idx = await getUserIdx(user_id);

    fetch('/followerList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_idx }) // 객체 형태로 변경
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            if ('message' in data) {
                // 만약 메시지 속성이 있다면, 즉, 팔로워 리스트가 비어 있다면 해당 메시지를 처리
                console.log('메시지:', data.message);
                const modalBody = document.querySelector('.modal-body .search-list');
                modalBody.innerHTML = '';
            } else {
                // 팔로워 리스트가 비어 있지 않다면 사용자 ID를 추출하여 모달에 삽입
                const userIDs = data.userList.map(user => user.ID);
                insertUsersIntoModal(userIDs);
            }
        })
        .catch(error => {
            console.error('오류:', error);
            // 에러 처리
        });

    async function insertUsersIntoModal(userIDs) {
        const modalBody = document.querySelector('.modal-body .search-list');

        // 기존에 있는 사용자 정보 제거
        modalBody.innerHTML = '';

        for (const userID of userIDs) {
            const profileImagePath = '../img/porfile.jpeg';
            const userName = userID;
            const useridx = await getUserIdx(userName);

            // 팔로우 상태 확인
            const isFollowing = await checkIsFollowing(useridx);

            const userHTML = `
                    <div class="content-wrapper">
                        <img src="${profileImagePath}" style="width: 40px; height: 40px;">
                        <a href="/profile/${userName}" style="font-size: 14px; font-weight: 700; 
                        text-decoration: none; color: black;">${userName}</a>
                        ${isFollowing ? '' : '<div class="following-list-btn follow" style="font-size: 12px; color: #0095F6;">팔로우</div>'}
                        <div class="following-list-btn delete" style="font-size: 14px; color: #0095F6; margin-left: auto;">삭제</div>
                    </div>
                `;

            modalBody.insertAdjacentHTML('beforeend', userHTML);
        }

        const followButtons = modalBody.querySelectorAll('.following-list-btn.follow');

        followButtons.forEach(followButton => {
            followButton.addEventListener('click', async () => {
                // 부모 요소에서 사용자 이름 가져오기
                const userName = followButton.closest('.content-wrapper').querySelector('a').textContent;

                // 사용자에게 확인 메시지를 보여줌
                const confirmfollow = window.confirm(`${userName}님을 팔로우 하시겠습니까?`);

                if (confirmfollow) {
                    console.log(userName);
                    await followUser(userName);
                }
            });
        });

        // 삭제 버튼에 대한 이벤트 리스너 추가
        const deleteButtons = modalBody.querySelectorAll('.following-list-btn.delete');

        deleteButtons.forEach(deleteButton => {
            deleteButton.addEventListener('click', () => {
                // 부모 요소에서 사용자 이름 가져오기
                const userName = deleteButton.closest('.content-wrapper').querySelector('a').textContent;

                // 사용자에게 확인 메시지를 보여줌
                const confirmUnfollow = window.confirm(`정말 ${userName}님을 팔로워에서 삭제 하시겠습니까?`);

                if (confirmUnfollow) {
                    // 확인이 눌렸을 때 언팔로우 로직을 수행하는 함수 호출
                    console.log(userName);
                    // unfollowUser 함수에 userName 전달
                    deletefollowwerUser(userName);
                }
            });
        });
    }

    async function checkIsFollowing(userIdx) {
        try {
            const response = await fetch(`/isFollowing/${userIdx}`);
            const data = await response.json();

            if (response.ok) {
                return data.isFollowing;
            } else {
                console.error('팔로우 여부 확인 중 서버 오류:', data.message);
                return false;
            }
        } catch (error) {
            console.error('팔로우 여부 확인 중 오류:', error.message);
            return false;
        }
    }
}