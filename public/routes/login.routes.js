const express = require('express');
const bcrypt = require('bcrypt'); // bcrypt를 사용하여 비밀번호를 비교
const db = require('../../models/db.js'); // db 모듈 가져오기

const router = express.Router();

router.post('/login', (req, res) => {
    const userData = req.body;

    // 사용자 정보(ID 또는 Email)로 DB에서 사용자 찾기
    db.query('SELECT * FROM User WHERE Email = ?', [userData.Email], (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
        } else {
            if (results.length > 0) {
                const user = results[0];
                // 사용자가 입력한 비밀번호와 DB에 저장된 암호화된 비밀번호 비교
                // DB에서 패스워드를 가져오면 Buffer 형태로 가져오기 때문에 문자열로 변환해서 bcrypt.compare을 시도 해야함.
                bcrypt.compare(userData.Password, user.Password.toString('utf-8'), (err, isMatch) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
                    } else {
                        if (isMatch) {
                            // 비밀번호 일치: 로그인 성공
                            req.session.user_id = user.idx;
                            req.session.nickname = user.ID; // 닉네임 정보를 세션에 저장
                            req.session.email = user.Email;
                            res.status(200).json({ message: '로그인 성공', redirectUrl: '/main' });
                        } else {
                            // 비밀번호 불일치
                            res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
                        }
                    }
                });
            } else {
                // 해당하는 사용자가 없음
                res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
            }
        }
    });
});

module.exports = router;