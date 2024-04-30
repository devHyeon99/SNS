import {
    profileUser, checkSession, saveDataToDatabase, getUserInfo,
    followUser, unfollowUser, postLoad, commentUpload, getComments,
    getUser, likePost, followList, followerList
} from './apiRequests.js';

// 새로 고침 함수
export function refreshButton() {
    const refreshButton = document.getElementById('Logo');
    const homeButton = document.getElementById('home');

    const handleClick = () => {
        window.location.href = '/main';
    };

    refreshButton.addEventListener('click', handleClick);
    homeButton.addEventListener('click', handleClick);
}

// 프로필 이동
export function profileBtn() {
    const button = document.querySelector('#profileBtn');
    button.addEventListener('click', () => {
        checkSession().then(data => {
            profileUser(data.nickname);
            console.log('프로필');
        });
    });
}

// 메뉴탭 게시글 작성 버튼
export function postwriteBtn() {
    const postwrite = document.getElementById('post-write');
    const fileInput = document.getElementById('fileInput');
    const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal')); // 모달 인스턴스 생성

    // 세션체크로 로그인이 되어 있을때만 사용가능하도록
    exampleModal._element.addEventListener('shown.bs.modal', function () {
        console.log('모달이 열림');
        checkSession().then(data => {
            if (data.nickname === undefined || data.nickname === null) {
                window.location.href = '/index'
                alert("로그인 후 사용하실 수 있습니다.");
            }
        });
    });

    const handleClick = () => {
        console.log("게시물 작성");
        fileInput.click(); // 파일 선택 창 열기
    };

    fileInput.addEventListener('change', () => {
        const selectedFile = fileInput.files[0];
        const reader = new FileReader();

        exampleModal.hide(); // 기존 모달 닫기

        reader.onload = function () {
            const preview = document.getElementById('imagePreview');
            preview.src = reader.result;

            // staticBackdrop 모달 열기를 setTimeout으로 지연
            const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
            modal.show();
        };

        if (selectedFile) {
            reader.readAsDataURL(selectedFile);
        }
    });

    postwrite.addEventListener('click', handleClick);
}

// 글자 수 카운트 함수
export function countChars() {
    const textarea = document.getElementById('post-text');
    const charCount = document.getElementById('charCount');

    textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length + '/1500';
    });
}

// 게시글 서버로 업로드 하는 함수
export function postuploadBtn() {
    const postuploadBtn = document.getElementById('postuploadBtn');
    const imagePreview = document.getElementById('imagePreview');
    const postText = document.getElementById('post-text');

    postuploadBtn.addEventListener('click', async () => {
        // 이미지와 텍스트 데이터 가져오기
        const textData = postText.value;
        const user_idx = await getUserInfo(); //getUserInfo() 함수에서 로그인한 사용자의 고유 넘버 idx를 가져옴.

        // 이미지 파일을 Blob으로 변환
        const imageData = await getImageBlobFromSrc(imagePreview.src);

        // 이미지 파일과 텍스트 데이터를 FormData에 추가
        const formData = new FormData();
        formData.append('image', imageData);
        formData.append('user_idx', user_idx);
        formData.append('text', textData);

        // FormData를 서버로 전송하는 함수 호출
        saveDataToDatabase(formData);
    });

    // 이미지 URL에서 Blob 파일을 생성하는 함수
    async function getImageBlobFromSrc(imageSrc) {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        return blob;
    }
}

export function followBtn() {
    const followBtn = document.getElementById("followBtn");
    const unfollowUserBtn = document.getElementById("unfollowBtn");

    // followBtn이 존재할 때만 이벤트 리스너 등록
    if (followBtn) {
        followBtn.addEventListener('click', () => {
            const encodedUserId = getUserIdFromUrl();
            const decodedUserId = decodeURIComponent(encodedUserId);
            console.log("팔로우 - 사용자 ID:", decodedUserId);
            // 팔로우 로직을 수행하는 함수 호출
            followUser(decodedUserId);
        });
    }

    // unfollowUserBtn이 존재할 때만 이벤트 리스너 등록
    if (unfollowUserBtn) {
        unfollowUserBtn.addEventListener('click', () => {
            const encodedUserId = getUserIdFromUrl();
            const decodedUserId = decodeURIComponent(encodedUserId);
            console.log("언팔로우 - 사용자 ID:", decodedUserId);
            // 사용자에게 확인 메시지를 보여줌
            const confirmUnfollow = window.confirm(`정말 ${decodedUserId}님을 언팔로우 하시겠습니까?`);

            if (confirmUnfollow) {
                // 언팔로우 로직을 수행하는 함수 호출
                unfollowUser(decodedUserId);
            }
        });
    }

    function getUserIdFromUrl() {
        const url = window.location.href;
        const parts = url.split('/');
        const userId = parts[parts.length - 1];
        return userId;
    }
}

export function postviewBtn() {
    var postBoxes = document.querySelectorAll('.post-box');

    postBoxes.forEach(function (postBox) {
        var postId = postBox.id.match(/\d+/)[0];

        postBox.addEventListener('click', function () {
            console.log('ID가', postId, '인 포스트를 클릭했습니다.');
            // 각 포스트 박스 내에 'img' 태그가 있다고 가정합니다.
            var postImage = postBox.querySelector('img');

            if (postImage) {
                // 이미지 소스에서 (base64 데이터 부분만) 가져옵니다.
                var imageDataBase64 = postImage.src.split(',')[1];

                // 모달 열기
                openModal(postId, imageDataBase64);
            } else {
                console.log('이 포스트에는 이미지가 없습니다.');
            }
        });
    });

    function formatTimeDifference(postTimestamp) {
        const timestamp = document.getElementById('timestamp');
        const postTime = new Date(postTimestamp);
        const currentTime = new Date();

        const timeDifferenceInSeconds = Math.floor((currentTime - postTime) / 1000);
    
        if (timeDifferenceInSeconds < 60) {
            timestamp.textContent = `${timeDifferenceInSeconds}초 전`;
        } else if (timeDifferenceInSeconds < 3600) {
            const minutesAgo = Math.floor(timeDifferenceInSeconds / 60);
            timestamp.textContent = `${minutesAgo}분`;
        } else if (timeDifferenceInSeconds < 86400) {
            const hoursAgo = Math.floor(timeDifferenceInSeconds / 3600);
            timestamp.textContent = `${hoursAgo}시간`;
        } else {
            const daysAgo = Math.floor(timeDifferenceInSeconds / 86400);
            timestamp.textContent = `${daysAgo}일`;
        }
    }

    function openModal(postId, imageDataBase64) {
        const post_content = document.getElementById('post_content');
        const post_user_id = document.getElementById('post_user_id');
        const user_post_id = document.getElementById('user_post_id');
        // 예시에서 postLoad 함수 호출
        postLoad(postId, (error, data) => {
            if (error) {
                console.error("포스트 로드 중 오류:", error);
            } else {
                console.log("포스트 로드 완료:", data);

                // data 객체에서 post와 user를 추출
                const { post, user, isLiked, likeCount, likedUserIds } = data;
                formatTimeDifference(post.created_at);
                updateLikeUI(isLiked, likeCount, likedUserIds);
                post_content.textContent = post.content;
                post_user_id.textContent = user.ID;
                user_post_id.textContent = user.ID;

                post_user_id.addEventListener('click', function () {
                    console.log("Dd")
                    window.location.href = `/profile/${user.ID}`;
                });
                user_post_id.addEventListener('click', function () {
                    console.log("Dd")
                    window.location.href = `/profile/${user.ID}`;
                });
                getComments(postId, (commentError, comments) => {
                    if (commentError) {
                        console.error("댓글 로드 중 오류:", commentError);
                    } else {
                        const commentsContainer = document.getElementById('commentsContainer');
                        commentsContainer.innerHTML = '';

                        // comments 배열을 순회하면서 댓글을 동적으로 추가
                        comments.forEach(comment => {
                            const { user_idx, content } = comment;

                            // 사용자 정보 가져오기
                            getUser(user_idx).then(userId => {
                                // 새로운 댓글 엘리먼트 생성
                                const commentElement = document.createElement('div');
                                commentElement.classList.add('content-wrapper');

                                // 이미지 엘리먼트 추가 (사용자 프로필 이미지)
                                const imgElement = document.createElement('img');
                                imgElement.src = '../img/porfile.jpeg';
                                imgElement.style.width = '32px';
                                imgElement.style.height = '32px';
                                commentElement.appendChild(imgElement);

                                // 사용자 이름 엘리먼트 추가
                                const usernameElement = document.createElement('a');
                                usernameElement.style.fontSize = '14px';
                                usernameElement.style.fontWeight = '700';
                                usernameElement.style.textDecoration = 'none';
                                usernameElement.style.color = 'black';
                                usernameElement.href = `/profile/${userId}`; // 주소 설정
                                usernameElement.textContent = userId; // 가져온 사용자 정보로 설정
                                commentElement.appendChild(usernameElement);

                                // 댓글 내용 엘리먼트 추가
                                const contentElement = document.createElement('span');
                                contentElement.style.fontSize = '12px';
                                contentElement.textContent = content;
                                commentElement.appendChild(contentElement);

                                // commentsContainer에 새로운 댓글 엘리먼트 추가
                                commentsContainer.appendChild(commentElement);
                            });
                        });
                    }
                });
            }
        });

        var modal = document.getElementById('postModal');
        var modalBody = modal.querySelector('.modalbody');
        var imgContainer = modalBody.querySelector('.img');

        modalBody.dataset.postId = postId;

        // 이미지 동적으로 추가
        var img = new Image();
        img.src = `data:image/png;base64,${imageDataBase64}`;
        img.alt = 'Post Image';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '92vh';
        img.style.height = '92vh';
        img.style.width = 'auto';

        // 기존의 내용을 비워주고 새로운 이미지를 추가
        imgContainer.innerHTML = '';
        imgContainer.appendChild(img);

        // 모달 열기
        var modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
}

export function postbox() {
    const likeBtn = document.querySelector(".like");
    const likePath = likeBtn.querySelector("path");
    const commentBtn = document.getElementById("comment-upload-btn");
    const commentContent = document.getElementById("comment-content");

    if (likeBtn && likePath) {
        likeBtn.addEventListener('click', async function () {
            const modal = document.getElementById('postModal');
            const modalBody = modal.querySelector('.modalbody');
            var postId = modalBody.dataset.postId;
            const user_idx = await getUserInfo(); //getUserInfo() 함수에서 로그인한 사용자의 고유 넘버 idx를 가져옴.
            likePost(postId, user_idx);
            likeRender(postId);
            console.log("좋아요");
        });
    }

    if (commentBtn) {
        commentBtn.addEventListener('click', async function () {
            const modal = document.getElementById('postModal');
            const modalBody = modal.querySelector('.modalbody');
            var postId = modalBody.dataset.postId;
            const user_idx = await getUserInfo(); //getUserInfo() 함수에서 로그인한 사용자의 고유 넘버 idx를 가져옴.

            console.log("댓글 업로드", postId, user_idx, commentContent.value);
            commentUpload(postId, user_idx, commentContent.value);
            commentRender(postId);
            commentContent.value = '';
        })
    }

    function likeRender(postId) {
        postLoad(postId, (error, data) => {
            if (error) {
                console.error("포스트 로드 중 오류:", error);
            } else {
                console.log("포스트 로드 완료:", data);

                const { isLiked, likeCount, likedUserIds } = data;
                updateLikeUI(isLiked, likeCount, likedUserIds);
            }
        });
    }

    function commentRender(postId) {
        const post_content = document.getElementById('post_content');
        const post_user_id = document.getElementById('post_user_id');
        const user_post_id = document.getElementById('user_post_id');

        // 예시에서 postLoad 함수 호출
        postLoad(postId, (error, data) => {
            if (error) {
                console.error("포스트 로드 중 오류:", error);
            } else {
                console.log("포스트 로드 완료:", data);

                // data 객체에서 post와 user를 추출
                const { post, user, isLiked, likeCount, likedUserIds } = data;
                updateLikeUI(isLiked, likeCount, likedUserIds);
                post_content.textContent = post.content;
                post_user_id.textContent = user.ID;
                user_post_id.textContent = user.ID;

                getComments(postId, (commentError, comments) => {
                    if (commentError) {
                        console.error("댓글 로드 중 오류:", commentError);
                    } else {
                        const commentsContainer = document.getElementById('commentsContainer');
                        commentsContainer.innerHTML = '';

                        // comments 배열을 순회하면서 댓글을 동적으로 추가
                        comments.forEach(comment => {
                            const { user_idx, content } = comment;

                            // 사용자 정보 가져오기
                            getUser(user_idx).then(userId => {
                                // 새로운 댓글 엘리먼트 생성
                                const commentElement = document.createElement('div');
                                commentElement.classList.add('content-wrapper');

                                // 이미지 엘리먼트 추가 (사용자 프로필 이미지)
                                const imgElement = document.createElement('img');
                                imgElement.src = '../img/porfile.jpeg';
                                imgElement.style.width = '32px';
                                imgElement.style.height = '32px';
                                commentElement.appendChild(imgElement);

                                // 사용자 이름 엘리먼트 추가
                                const usernameElement = document.createElement('div');
                                usernameElement.style.fontSize = '14px';
                                usernameElement.style.fontWeight = '700';
                                usernameElement.textContent = userId; // 가져온 사용자 정보로 설정
                                commentElement.appendChild(usernameElement);

                                // 댓글 내용 엘리먼트 추가
                                const contentElement = document.createElement('span');
                                contentElement.style.fontSize = '12px';
                                contentElement.textContent = content;
                                commentElement.appendChild(contentElement);

                                // commentsContainer에 새로운 댓글 엘리먼트 추가
                                commentsContainer.appendChild(commentElement);
                            });
                        });
                    }
                });
            }
        });
    }
}

function updateLikeUI(isLiked, likeCount, likedUserIds) {
    const likeBtn = document.querySelector(".like");
    const likePath = likeBtn.querySelector("path");
    console.log(likeCount, likedUserIds);
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

    // 좋아하는 사용자들의 정보를 비동기적으로 모두 가져오기
    Promise.all(likedUserIds.map(userId => getUser(userId)))
        .then(users => {
            // UI를 업데이트할 컨테이너 요소 찾기
            const likeContainer = document.querySelector('.user-like-box');

            // 기존에 추가된 자식 요소 모두 제거
            while (likeContainer.firstChild) {
                likeContainer.removeChild(likeContainer.firstChild);
            }

            // 가져온 사용자 정보를 기반으로 UI 업데이트
            if (users.length > 0) {
                // 첫 번째 사용자 정보를 기준으로 이미지 및 이름 추가
                const firstUser = users[0];
                // 새로운 div 요소 생성
                const likeTextContainer = document.createElement('div');
                likeTextContainer.className = 'content-wrapper';
                likeTextContainer.style.padding = '10px 0px 0px 2px';
                likeTextContainer.style.userSelect = 'auto';

                // 이미지 요소 추가
                const imgElement = document.createElement('img');
                imgElement.src = '../img/porfile.jpeg';
                imgElement.style.width = '20px';
                imgElement.style.height = '20px';
                imgElement.style.userSelect = 'auto';
                likeTextContainer.appendChild(imgElement);

                // 텍스트 요소 추가
                const textElement = document.createElement('div');
                textElement.style.fontSize = '14px';
                textElement.style.userSelect = 'auto';
                textElement.innerHTML = `<strong>${firstUser}</strong>님 외 <strong>${users.length - 1}명</strong>이 좋아합니다.`;
                likeTextContainer.appendChild(textElement);

                // 생성한 div를 컨테이너에 추가
                likeContainer.appendChild(likeTextContainer);
            } else {
                // 새로운 div 요소 생성
                const likeTextContainer = document.createElement('div');
                likeTextContainer.className = 'content-wrapper';
                likeTextContainer.style.padding = '10px 0px 0px 2px';
                likeTextContainer.style.userSelect = 'auto';

                // 텍스트 요소 추가
                const textElement = document.createElement('div');
                textElement.style.fontSize = '14px';
                textElement.style.userSelect = 'auto';
                textElement.innerHTML = `첫번째 좋아요를 눌러보세요.`;
                likeTextContainer.appendChild(textElement);

                // 생성한 div를 컨테이너에 추가
                likeContainer.appendChild(likeTextContainer);
            }
        })
        .catch(error => {
            console.error('사용자 정보를 가져오는 중 에러 발생:', error);
        });
}

export function userEvent() {
    const followerlistBtn = document.getElementById('followerlistBtn');
    const followlistBtn = document.getElementById('followlistBtn');
    const searchInput = document.getElementById('searchInput');
    // 포커스 이벤트 처리
    searchInput.addEventListener('focus', function () {
        // 돋보기 아이콘을 숨김
        document.querySelector('.search-icon').style.display = 'none';
    });

    // 포커스 아웃 이벤트 처리
    searchInput.addEventListener('blur', function () {
        // 입력창이 비어있으면 돋보기 아이콘을 다시 표시
        if (!searchInput.value.trim()) {
            document.querySelector('.search-icon').style.display = 'block';
        }
    });

    if (followerlistBtn) {
        followerlistBtn.addEventListener('click', function () {
            console.log("팔로워 리스트 버튼");
            $('#followerModalLabel').text('팔로워');
            $('#followerModal').modal('show');
            followerList();
        })
    }

    if (followlistBtn) {
        followlistBtn.addEventListener('click', function () {
            console.log("팔로우 리스트 버튼");
            $('#followerModalLabel').text('팔로우');
            $('#followerModal').modal('show');
            followList();
        })
    }
}