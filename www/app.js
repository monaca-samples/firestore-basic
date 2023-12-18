// FirebaseのSDKをインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, limit} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebaseの設定
const firebaseConfig = {
    
};

// Firebaseの初期化
initializeApp(firebaseConfig);

// Firestoreのインスタンスを取得
const db = getFirestore();

// ローカルに保持するデータのリスト
let records = [];

// テーブルに新しい行を追加する関数
const renderTableRow = (data) => {
    const tableBody = document.getElementById("data_table").tBodies[0];
    const rowHTML = `
        <tr>
            <td>${data.date}</td>
            <td>${data.item}</td>
            <td>${data.price}</td>
        </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', rowHTML);
};

// 追加ボタンがクリックされたときの処理
const onClickAdd = () => {
    const data = {
        date: document.getElementById("input_date").value,
        item: document.getElementById("input_item").value,
        price: document.getElementById("input_price").value
    };

    records.push({ id: "", data });
    renderTableRow(data);
};

// 読み込みボタンがクリックされたときの処理
const onClickLoad = async () => {
    try {
        // 'records' コレクションから最大10件のドキュメントを取得するクエリを実行
        const querySnapshot = await getDocs(query(collection(db, "records"), limit(10)));

        // 取得したドキュメントのデータを処理して新しい配列を作成
        records = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                data: {
                    date: data.date,   // 特定のフィールドを取得
                    item: data.item,
                    price: data.price
                }
            };
        });

        // テーブルの中身を空にする
        const tableBody = document.getElementById("data_table").tBodies[0];
        tableBody.innerHTML = '';

        // recordsに入っているデータをテーブルに追加
        records.forEach(doc => renderTableRow(doc.data));
    } catch (error) {
        alert("データの読み込みに失敗しました。エラーコード: " + error);
    }
};

// 保存ボタンがクリックされたときの処理
const onClickSave = async () => {
    for (const record of records) {
        try {
            if (record.id) { // IDがある場合は更新
                // レコードのIDを使ってFirebaseデータベース内のドキュメントへの参照を取得します。
                const recordRef = doc(db, "records", record.id);
                // 取得した参照に対して、レコードのデータで更新を行います。
                await updateDoc(recordRef, record.data);
                console.log("データが正常に更新されました。");
            } else {
                // レコードに 'id' プロパティが存在しない場合、新しいドキュメントを作成します。
                const docRef = await addDoc(collection(db, "records"), record.data);
                record.id = docRef.id;
                console.log("データが正常に作成されました。");
            }

        } catch (error) {
            console.error("データの保存または更新に失敗しました:", error);
        }
    }
};

export { onClickAdd, onClickLoad, onClickSave };
