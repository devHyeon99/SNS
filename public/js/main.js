import {
    refreshButton, profileBtn, postwriteBtn, countChars,
    postuploadBtn, followBtn, postviewBtn, postbox,
    userEvent
} from './maineventListener.js';

refreshButton(); // 새로고침
profileBtn(); // 프로필 이동 버튼
postwriteBtn(); // 메뉴탭 작성하기 버튼
countChars(); // 글자 수 세는 함수
postuploadBtn(); // 게시글 작성 후 공유하기 버튼
followBtn(); // 팔로우 및 언팔로우 관련 이벤트 리스너
postviewBtn(); // 포스트 클릭시 이벤트 리스너
postbox(); // 포스트 관련 리스너
userEvent(); // 유저 정보 관련 이벤트 리스너