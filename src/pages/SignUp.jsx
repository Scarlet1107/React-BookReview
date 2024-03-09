import axios from "axios";
import Compressor from "compressorjs";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signIn } from "../authSlice";
import { Header } from "../components/Header";
import { url } from "../const";
import "./signUp.scss";

export const SignUp = () => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.isSignIn);
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [icon, setIcon] = useState();
  const [errorMessage, setErrorMessge] = useState();
  const [cookies, setCookie, removeCookie] = useCookies();
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleNameChange = (e) => setName(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleIconChange = (e) => { setIcon(e.target.files[0]) };

  const onSignUp = () => {

    //ここでemail, name, passwordのバリデーションを行う
    if (email === "") {
      setErrorMessge("メールアドレスを入力してください");
      return;
    }
    if (name === "") {
      setErrorMessge("ユーザ名を入力してください");
      return;
    }
    if (password === "") {
      setErrorMessge("パスワードを入力してください");
      return;
    }
    const data = {
      email: email,
      name: name,
      password: password
    };

    axios.post(`${url}/users`, data)
      .then((res) => {
        const token = res.data.token;
        console.log("token is " + token);
        dispatch(signIn());
        setCookie("token", token);
      })
      .catch((err) => {
        setErrorMessge(`サインアップに失敗しました。 ${err}`);
      })
    uploadIcon();
    if
      (auth) {
        console.log("正常にサインアップしました")
        navigate("/");
      }
    else {
      setErrorMessge("サインアップに失敗しました");
      return;
    }
  };


  //画像のアップロードを処理
  const uploadIcon = async () => {
    const formData = new FormData();

    //画像を圧縮
    const compressedIcon = await new Promise((resolve, reject) => {
      new Compressor(icon, {
        quality: 0.6, //圧縮品質を0.6に設定
        success(result) {
          resolve(result);  //圧縮後の状態を"icon"に保存
        },
        error(err) {
          reject(err);
        },
      });
    });

    formData.append("icon", compressedIcon);

    try {
      const response = await axios({
        method: 'post',
        url: `${url}/uploads`,
        data: formData,
        headers: {
          'Authorization': `Bearer ${cookies.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
    } catch (err) {
      console.log("画像のアップロードに失敗しました");
      console.log(err);
    }
  };



  return (
    <div>
      <Header />
      <main className="signup">
        <h2>新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="signup-form">
          <label>メールアドレス</label><br />
          <input type="email" onChange={handleEmailChange} className="email-input" /><br />
          <label>ユーザ名</label><br />
          <input type="text" onChange={handleNameChange} className="name-input" /><br />
          <label>パスワード</label><br />
          <input type="password" onChange={handlePasswordChange} className="password-input" /><br />

          <p>アイコンをアップロード</p>
          <input type="file" onChange={handleIconChange} className="file-input" />

          <button type="button" onClick={onSignUp} className="signup-button">作成</button>
        </form>
      </main>
    </div>
  )
}