const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../models/db.js'); // db 모듈 가져오기

const router = express.Router();

router.post('/register', (req, res) => {
    const userData = req.body;

    // 사용자가 입력한 비밀번호를 bcrypt를 사용하여 암호화
    bcrypt.hash(userData.Password, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: '비밀번호 암호화 중 오류가 발생했습니다.' });
        } else {
            db.query('SELECT * FROM User WHERE ID = ? OR Email = ?', [userData.ID, userData.Email], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
                } else {
                    const existingID = results.find(user => user.ID === userData.ID);
                    const existingEmail = results.find(user => user.Email === userData.Email);

                    if (existingID && existingEmail) {
                        res.status(400).json({ error: '이미 존재하는 ID와 Email입니다.' });
                    } else if (existingID) {
                        res.status(400).json({ error: '이미 존재하는 ID입니다.' });
                    } else if (existingEmail) {
                        res.status(400).json({ error: '이미 존재하는 Email입니다.' });
                    } else {
                        // 암호화된 비밀번호를 데이터베이스에 저장
                        db.query('INSERT INTO User (ID, Email, Password) VALUES (?, ?, ?)', [userData.ID, userData.Email, hashedPassword], (error, results, fields) => {
                            if (error) {
                                console.error(error);
                                res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
                            } else {
                                res.json({ message: '회원가입 성공' });
                            }
                        });
                    }
                }
            });
        }
    });
});

module.exports = router;
