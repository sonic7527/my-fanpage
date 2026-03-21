"use client";

import Script from "next/script";

/**
 * tawk.to 聊天視窗元件
 *
 * 使用方式：
 * 1. 到 tawk.to 建立帳號
 * 2. 建立 Property，取得 Property ID 和 Widget ID
 * 3. 在 .env.local 設定 NEXT_PUBLIC_TAWK_PROPERTY_ID 和 NEXT_PUBLIC_TAWK_WIDGET_ID
 */
export default function TawkWidget() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

  if (!propertyId || !widgetId) return null;

  return (
    <Script
      id="tawk-to"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
