export interface QAEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  priority?: number;
}

export const qaEntries: QAEntry[] = [
  {
    id: "greeting",
    keywords: ["你好", "哈囉", "嗨", "請問", "想問", "想請問", "hi", "hello"],
    question: "打招呼",
    answer:
      "您好！歡迎來到北大液晶儀表維修工作室 🔧\n有什麼我可以幫您的嗎？您可以直接輸入問題，或點選下方快速選項。",
    priority: 0,
  },
  {
    id: "hours",
    keywords: ["營業", "時間", "幾點", "開門", "休息", "上班", "星期", "禮拜", "週幾"],
    question: "營業時間",
    answer:
      "我們的營業時間：\n📍 高雄據點 — 週一、週三\n📍 屏東據點 — 週二、週四、週五\n🕘 10:30 – 18:00\n🚫 週六、日公休\n\n如有特殊時段需求可以提前預約喔！",
    priority: 1,
  },
  {
    id: "address",
    keywords: ["地址", "在哪", "哪裡", "怎麼去", "位置", "據點", "門市", "地點", "維修地點"],
    question: "維修地點",
    answer:
      "我們有兩個服務據點：\n\n📍 屏東（週二、四、五）\n屏東市頂柳路539巷78號\nGoogle 搜尋「北大液晶」就可以導航囉！\n\n📍 高雄（週一、三）\n高雄市苓雅區建國一路64巷59號\nGoogle 搜尋「北大液晶 高雄」就可以導航囉！\n\n📞 聯絡電話：0958-320-153\n記得先預約再過來喔！",
    priority: 1,
  },
  {
    id: "pricing",
    keywords: ["多少錢", "費用", "價格", "價位", "報價", "收費", "怎麼算"],
    question: "維修費用",
    answer:
      "維修費用價格平均約 1000–2000 之間，依照損壞情況與車款有所不同。\n\n請透過 LINE 傳送儀表照片，我們可以先幫您初步評估！\n📱 LINE: @777xvkrg",
    priority: 1,
  },
  {
    id: "services",
    keywords: ["服務", "可以修", "維修", "液晶", "淡化", "斷字", "按鍵", "故障", "修什麼"],
    question: "維修服務",
    answer:
      "我們提供三大維修服務：\n\n1️⃣ 液晶淡化修復 — 直接更換全新液晶\n2️⃣ 斷字顯示修復 — 數字筆劃消失\n3️⃣ 按鍵故障排除 — 按壓無反應\n\n⚠️ 僅服務一般機車儀表，重機與汽車恕不服務。",
    priority: 1,
  },
  {
    id: "repair-time",
    keywords: ["多久", "幾天", "工作天", "等多久", "快嗎", "要等"],
    question: "維修時間",
    answer:
      "⏱ 現場維修：工時約 1 小時，可現場等待或事後取車\n📦 郵寄維修：收到儀表後 3 個工作天內寄回\n❌ 若無法維修，隔日寄回\n\n全程透過 LINE 回報進度！",
    priority: 2,
  },
  {
    id: "mail-repair",
    keywords: ["寄件", "郵寄", "寄修", "快遞", "不在附近", "外縣市", "怎麼寄", "寄送"],
    question: "寄件維修",
    answer:
      "寄件維修流程：\n\n1️⃣ 先透過 LINE 聯繫，告知車款與問題\n2️⃣ 將儀表用氣泡紙包好，寄至屏東據點\n3️⃣ 收到後檢測報價，確認後維修\n4️⃣ 完成後 3 個工作天內寄回\n\n📱 LINE: @777xvkrg",
    priority: 2,
  },
  {
    id: "warranty",
    keywords: ["保固", "保修", "保證", "壞了怎麼辦"],
    question: "保固說明",
    answer:
      "所有維修項目提供 6 個月保固。\n\n✅ 保固期間相同問題免費維修\n❌ 儀表進水或碰撞損壞不在保固範圍\n\n有保固問題歡迎透過 LINE 聯繫我們！",
    priority: 1,
  },
  {
    id: "appointment",
    keywords: ["預約", "怎麼預約", "如何預約", "預約制", "要預約"],
    question: "如何預約",
    answer:
      "預約方式：\n📱 LINE 官方帳號: @777xvkrg（推薦）\n📞 電話: 0958-320-153\n\n請告知您的車款、問題描述，我們會安排時間。",
    priority: 2,
  },
  {
    id: "contact",
    keywords: ["聯絡", "電話", "手機", "打電話", "怎麼聯繫", "聯繫"],
    question: "聯絡方式",
    answer:
      "📱 LINE 官方帳號: @777xvkrg\n📞 電話: 0958-320-153\n\nLINE 回覆最快，歡迎直接加好友詢問！",
    priority: 1,
  },
  {
    id: "vehicle-types",
    keywords: ["重機", "汽車", "車種", "什麼車", "哪些車", "機車", "品牌"],
    question: "可維修車種",
    answer:
      "我們可維修大部分一般機車品牌：\n🏍 KYMCO、SYM、YAMAHA、PGO、SUZUKI、GOGORO、AEON、Vespa\n\n⚠️ 重機與汽車儀表板恕不服務。\n詳細可維修車款請參考我們的文章列表！",
    priority: 1,
  },
  {
    id: "difference",
    keywords: ["差別", "不同", "偏光片", "為什麼選", "跟別人", "比較"],
    question: "我們的優勢",
    answer:
      "市面上很多店家是更換偏光片來處理液晶淡化，我們是直接更換全新液晶面板。\n\n✅ 全新液晶 — 顯示效果如同新品\n✅ 壽命更長 — 根本解決問題\n✅ 不是治標 — 而是治本的方案",
    priority: 1,
  },
];

export const defaultSuggestions = [
  "維修費用",
  "維修時間",
  "寄件維修",
  "營業時間",
  "保固說明",
  "維修地點",
];
