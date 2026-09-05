/*
 * ポケふたと写真の紐づけは、このファイルだけを編集します。
 * photo に assets/photos 内の写真パスを指定してください。
 */
window.POKEFUTA_DATA = {
  regions: [
    { id: "hokkaido", name: "北海道", short: "北", note: "雪と港町をめぐる、北の旅。", prefectures: ["hokkaido"] },
    { id: "tohoku", name: "東北", short: "東北", note: "山海のあいだを、ゆっくり北上。", prefectures: ["aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima"] },
    { id: "kanto", name: "関東", short: "関東", note: "街角と公園にひそむ、小さな発見。", prefectures: ["ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa"] },
    { id: "chubu", name: "中部", short: "中部", note: "山、湖、海。景色の変わる道。", prefectures: ["niigata", "toyama", "ishikawa", "fukui", "yamanashi", "nagano", "gifu", "shizuoka", "aichi"] },
    { id: "kinki", name: "近畿", short: "近畿", note: "古い町並みと水辺をたどる。", prefectures: ["mie", "shiga", "kyoto", "osaka", "hyogo", "nara", "wakayama"] },
    { id: "chugoku", name: "中国", short: "中国", note: "白壁、砂丘、山陰山陽の寄り道。", prefectures: ["tottori", "shimane", "okayama", "hiroshima", "yamaguchi"] },
    { id: "shikoku", name: "四国", short: "四国", note: "島の風と、のんびり歩く旅。", prefectures: ["tokushima", "kagawa", "ehime", "kochi"] },
    { id: "kyushu", name: "九州・沖縄", short: "九州", note: "湯けむりから南国の風まで。", prefectures: ["fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa"] }
  ],
  prefectures: [
    ["hokkaido", "北海道", "hokkaido"],
    ["aomori", "青森県", "tohoku"], ["iwate", "岩手県", "tohoku"], ["miyagi", "宮城県", "tohoku"], ["akita", "秋田県", "tohoku"], ["yamagata", "山形県", "tohoku"], ["fukushima", "福島県", "tohoku"],
    ["ibaraki", "茨城県", "kanto"], ["tochigi", "栃木県", "kanto"], ["gunma", "群馬県", "kanto"], ["saitama", "埼玉県", "kanto"], ["chiba", "千葉県", "kanto"], ["tokyo", "東京都", "kanto"], ["kanagawa", "神奈川県", "kanto"],
    ["niigata", "新潟県", "chubu"], ["toyama", "富山県", "chubu"], ["ishikawa", "石川県", "chubu"], ["fukui", "福井県", "chubu"], ["yamanashi", "山梨県", "chubu"], ["nagano", "長野県", "chubu"], ["gifu", "岐阜県", "chubu"], ["shizuoka", "静岡県", "chubu"], ["aichi", "愛知県", "chubu"],
    ["mie", "三重県", "kinki"], ["shiga", "滋賀県", "kinki"], ["kyoto", "京都府", "kinki"], ["osaka", "大阪府", "kinki"], ["hyogo", "兵庫県", "kinki"], ["nara", "奈良県", "kinki"], ["wakayama", "和歌山県", "kinki"],
    ["tottori", "鳥取県", "chugoku"], ["shimane", "島根県", "chugoku"], ["okayama", "岡山県", "chugoku"], ["hiroshima", "広島県", "chugoku"], ["yamaguchi", "山口県", "chugoku"],
    ["tokushima", "徳島県", "shikoku"], ["kagawa", "香川県", "shikoku"], ["ehime", "愛媛県", "shikoku"], ["kochi", "高知県", "shikoku"],
    ["fukuoka", "福岡県", "kyushu"], ["saga", "佐賀県", "kyushu"], ["nagasaki", "長崎県", "kyushu"], ["kumamoto", "熊本県", "kyushu"], ["oita", "大分県", "kyushu"], ["miyazaki", "宮崎県", "kyushu"], ["kagoshima", "鹿児島県", "kyushu"], ["okinawa", "沖縄県", "kyushu"]
  ].map(([id, name, region]) => ({ id, name, region })),
  spots: [
    {
      id: "hakodate-aoyagi", prefecture: "hokkaido", city: "函館市", area: "青柳町",
      title: "函館・青柳町のポケふた", address: "北海道函館市青柳町17",
      photo: "assets/photos/hakodate-aoyagi.jpg", photographed: "", memo: "路面電車と坂の町を歩いた日の一枚。",
      source: "https://local.pokemon.jp/manhole/desc/187/"
    },
    {
      id: "sendai-ichibancho", prefecture: "miyagi", city: "仙台市", area: "一番町",
      title: "仙台・一番町のポケふた", address: "宮城県仙台市青葉区一番町二丁目6-5",
      photo: "assets/photos/sendai-ichibancho.jpg", photographed: "", memo: "商店街の散歩と一緒に立ち寄る一枚。",
      source: "https://local.pokemon.jp/manhole/desc/54/"
    },
    {
      id: "machida-serigaya", prefecture: "tokyo", city: "町田市", area: "芹ヶ谷公園",
      title: "町田・芹ヶ谷公園のポケふた", address: "東京都町田市原町田5-16",
      photo: "assets/photos/machida-serigaya.jpg", photographed: "", memo: "緑のなかで見つけた、街歩きのしるし。",
      source: "https://local.pokemon.jp/manhole/desc/101/"
    },
    {
      id: "yokohama-minatomirai", prefecture: "kanagawa", city: "横浜市", area: "みなとみらい",
      title: "横浜・みなとみらいのポケふた", address: "神奈川県横浜市西区みなとみらい2-1-1",
      photo: "assets/photos/yokohama-minatomirai.jpg", photographed: "", memo: "潮風の通る遊歩道で見つけた一枚。",
      source: "https://local.pokemon.jp/manhole/desc/314/"
    },
    {
      id: "tokoname-rinku", prefecture: "aichi", city: "常滑市", area: "りんくうビーチ",
      title: "常滑・りんくうビーチのポケふた", address: "愛知県常滑市りんくう町2丁目 りんくうビーチ",
      photo: "assets/photos/tokoname-rinku.jpg", photographed: "", memo: "夕日と飛行機を眺めながら歩く海辺。",
      source: "https://local.pokemon.jp/manhole/desc/406/"
    },
    {
      id: "otsu-shimanoseki", prefecture: "shiga", city: "大津市", area: "島の関",
      title: "大津・島の関のポケふた", address: "滋賀県大津市島の関14",
      photo: "assets/photos/otsu-shimanoseki.jpg", photographed: "", memo: "琵琶湖からの風を感じる水辺の寄り道。",
      source: "https://local.pokemon.jp/manhole/desc/104/"
    },
    {
      id: "kyoto-umekoji", prefecture: "kyoto", city: "京都市", area: "梅小路",
      title: "京都・梅小路のポケふた", address: "京都府京都市下京区観喜寺町",
      photo: "assets/photos/kyoto-umekoji.jpg", photographed: "", memo: "古都の旅に、少し新しい楽しみを。",
      source: "https://local.pokemon.jp/manhole/desc/163/"
    },
    {
      id: "kurashiki-bikan", prefecture: "okayama", city: "倉敷市", area: "美観地区",
      title: "倉敷・美観地区のポケふた", address: "岡山県倉敷市中央1-18-1",
      photo: "assets/photos/kurashiki-bikan.jpg", photographed: "", memo: "白壁と柳並木の先で出会う旅のしるし。",
      source: "https://local.pokemon.jp/manhole/desc/196/"
    },
    {
      id: "tottori-kodomonokuni", prefecture: "tottori", city: "鳥取市", area: "こどもの国",
      title: "鳥取・こどもの国のポケふた", address: "鳥取県鳥取市浜坂1157-1",
      photo: "assets/photos/tottori-kodomonokuni.jpg", photographed: "", memo: "砂丘へ向かう途中に立ち寄りたい一枚。",
      source: "https://local.pokemon.jp/manhole/desc/300/"
    },
    {
      id: "ayagawa-hidamari", prefecture: "kagawa", city: "綾川町", area: "ひだまり公園",
      title: "綾川・ひだまり公園のポケふた", address: "香川県綾川町萱原253-7",
      photo: "assets/photos/ayagawa-hidamari.jpg", photographed: "", memo: "讃岐うどんの寄り道に、公園でひと休み。",
      source: "https://local.pokemon.jp/manhole/desc/298/"
    },
    {
      id: "kitakyushu-mojiko", prefecture: "fukuoka", city: "北九州市", area: "門司港レトロ",
      title: "北九州・門司港のポケふた", address: "福岡県北九州市門司区港町5 門司港レトロ地区",
      photo: "assets/photos/kitakyushu-mojiko.jpg", photographed: "", memo: "歴史ある港町を歩きながら見つける一枚。",
      source: "https://local.pokemon.jp/manhole/desc/201/"
    },
    {
      id: "ibusuki-station", prefecture: "kagoshima", city: "指宿市", area: "指宿駅前",
      title: "指宿・駅前のポケふた", address: "鹿児島県指宿市湊1丁目1-1",
      photo: "assets/photos/ibusuki-station.jpg", photographed: "", memo: "温泉の町へ着いたら、最初に会える旅の印。",
      source: "https://local.pokemon.jp/manhole/desc/1/"
    },
    {
      id: "naha-kokusai", prefecture: "okinawa", city: "那覇市", area: "国際通り",
      title: "那覇・国際通りのポケふた", address: "沖縄県那覇市牧志3丁目2",
      photo: "assets/photos/naha-kokusai.jpg", photographed: "", memo: "にぎやかな通りで南の旅を刻む一枚。",
      source: "https://local.pokemon.jp/manhole/desc/174/"
    }
  ]
};
