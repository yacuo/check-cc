import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const verifyCodes = new Set(["337583", "227721", "883376", "787899", "232363"]);

const checkItems = [
  { text: "Cloudflare 检测浏览器环境...", icon: "check" },
  { text: "Cloudflare 验证 User-Agent 信息...", icon: "check" },
  { text: "Cloudflare 检查 Cookie 状态...", icon: "check" },
  { text: "Cloudflare 检测 JavaScript 执行环境...", icon: "check" },
  { text: "Cloudflare 验证是否为真人访问...", icon: "cross" },
  { text: "Cloudflare 检测自动化工具...", icon: "cross" },
];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 1024 1024" className="inline-block size-6 align-middle">
      <path d="M859.553531 223.46735c-131.266167-0.273397-251.874989-45.271187-347.712244-120.449085-95.882309 75.019185-216.28634 120.176713-347.417344 120.449085-87.404969 286.237962 63.019433 593.928847 347.531004 697.515408C796.534098 817.396197 946.982051 509.705312 859.553531 223.46735zM201.448179 514.182052l310.551821 0L512 160.980375c92.522706 64.419182 199.064407 101.307233 311.691485 107.939403 19.76237 82.987619 18.331902 166.81181-1.178574 245.262275L512 514.182052 512 871.126293c-0.015359 0.006144-0.029695 0.012287-0.045054 0.018431C352.376368 807.140244 240.559241 671.464918 201.448179 514.182052z" fill="#000000" />
    </svg>
  );
}

function CloudflareLogo() {
  return (
    <svg viewBox="0 0 2264 1024" className="mx-auto h-[61px] w-[135px]">
      <path d="M1508.937329 985.978115l11.28587-39.131381c13.395378-46.514661 8.438034-89.443157-14.133707-121.085783-21.095084-29.111216-55.480071-46.198234-97.564764-48.202267L611.868876 767.433043a15.504887 15.504887 0 0 1-14.239182-21.095084 21.095084 21.095084 0 0 1 18.458199-14.133706l804.355558-10.547542c94.927879-4.324492 198.715693-81.743451 234.893762-176.249428l45.776332-119.820078a28.267413 28.267413 0 0 0 1.898558-10.547542 34.912364 34.912364 0 0 0-0.632853-5.695673 523.896414 523.896414 0 0 0-1007.184792-54.214366 235.737565 235.737565 0 0 0-369.163972 247.023435A334.67351 334.67351 0 0 0 3.6976 986.294541a15.504887 15.504887 0 0 0 15.293936 13.395379h1471.276643a19.302002 19.302002 0 0 0 18.66915-13.711805z" fill="#F4801F" />
      <path d="M1774.418962 434.658091q-10.547542 0-22.149838 0.632853a9.281837 9.281837 0 0 0-3.375213 0.738327 12.340624 12.340624 0 0 0-8.016132 8.438034l-31.642626 108.217782c-13.500854 46.514661-8.543509 89.443157 14.133706 121.085783a122.878865 122.878865 0 0 0 97.459289 48.202267l169.920902 10.547542a15.188461 15.188461 0 0 1 12.024198 6.539476 15.821313 15.821313 0 0 1 1.793082 14.450133 21.095084 21.095084 0 0 1-18.458198 14.133706l-176.460379 10.547542c-95.877157 4.429968-199.137594 81.743451-235.315664 176.143953l-12.762525 33.330233a9.492788 9.492788 0 0 0 8.332558 12.868001h607.854849a16.34869 16.34869 0 0 0 16.243215-12.340624 436.035389 436.035389 0 0 0-419.370273-553.535008z" fill="#F9AB41" />
    </svg>
  );
}

function StatusIcon({ icon }: { icon: string }) {
  return icon === "check" ? (
    <svg width="24" height="24" viewBox="0 0 1024 1024" className="mr-1.5 inline-block align-middle"><path d="M997.888 70.144C686.592 261.12 460.8 502.272 358.912 623.104l-248.832-195.072-110.08 88.576 429.568 437.248c73.728-189.44 308.224-559.616 594.432-822.784l-26.112-60.928m0 0z" fill="#52c41a" /></svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 1024 1024" className="mr-1.5 inline-block align-middle"><path d="M86.016 0l-83.968 70.656c149.504 111.616 288.768 239.616 411.136 367.616-187.392 188.928-334.336 374.784-411.648 449.536l159.744 133.632c56.832-117.248 180.224-294.912 345.6-481.28 165.376 187.392 289.28 366.08 346.112 483.84 0 0 155.648-165.376 169.472-139.776C962.56 816.64 816.128 620.032 619.52 418.816c112.64-115.712 239.104-230.4 374.272-331.264l-36.864-68.608c-153.088 76.288-299.008 189.44-430.08 309.76-132.096-125.44-281.6-244.736-440.832-328.704z" fill="#ff4d4f" /></svg>
  );
}

export function SignalUnlockModal({ onClose, onUnlock }: { hiddenCount: number; onClose: () => void; onUnlock: () => void }) {
  const [index, setIndex] = useState(2);
  const [manualVerify, setManualVerify] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [error, setError] = useState("");
  const complete = index >= checkItems.length;
  const showVerify = manualVerify || complete;
  const visibleItems = checkItems.slice(Math.max(0, Math.min(index, checkItems.length) - 2), Math.min(index, checkItems.length));

  useEffect(() => {
    if (manualVerify || complete) return;
    const timer = window.setInterval(() => {
      setIndex((value) => Math.min(value + 2, checkItems.length));
    }, 667);
    return () => window.clearInterval(timer);
  }, [complete, manualVerify]);

  function submitVerify() {
    if (!showVerify) {
      setManualVerify(true);
      setIndex(checkItems.length);
      return;
    }
    const value = captcha.trim();
    if (!verifyCodes.has(value)) {
      setError("验证码错误，请输入，6位，微信获取的，数字验证码！");
      return;
    }
    try {
      window.sessionStorage.setItem("checkcc_verify_code", value);
    } catch {}
    onUnlock();
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] grid place-items-center bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[500px] rounded-2xl border border-stone-200 bg-white p-6 text-center text-stone-900 shadow-2xl shadow-black/20" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-center gap-2 text-[21px] font-bold leading-8 text-[#0b1220]">
          <ShieldIcon />
          <span>安全验证 | 反爬虫，人机识别</span>
        </div>

        <div className="mt-5 min-h-5 text-lg leading-5 text-[#0b1220]">Cloudflare Verifying your browser access...</div>
        <div className="mt-2 text-[17px] leading-5 text-stone-600">正在验证您的浏览器访问请求...</div>

        {!showVerify && <div className="my-3"><CloudflareLogo /></div>}

        <div className="my-2 min-h-10 text-center leading-7">
          {!showVerify ? visibleItems.map((item) => (
            <div key={item.text} className="text-center text-[21px] font-bold leading-8 text-stone-700">
              <StatusIcon icon={item.icon} />
              <span>{item.text}</span>
            </div>
          )) : (
            <div className="mt-8 text-center text-[20px] font-semibold leading-8 text-red-600">无法确认您是真人访问，请微信扫码验证</div>
          )}
        </div>

        {showVerify && (
          <div className="mt-4 animate-in fade-in duration-300">
            <div className="mx-auto w-fit rounded-xl bg-white p-2 shadow-lg shadow-black/30 ring-1 ring-white/20">
              <img className="size-40" src="https://www.ddkk.com/images/BlogLogIn.png?vip=1783344871" alt="验证码" />
            </div>
            <div className="mt-3 text-[22px] font-bold leading-8 text-[#0b1220] sm:text-[29px] sm:leading-[43px]">微信关注公众号，回复：验证码</div>
            <input
              value={captcha}
              onChange={(event) => { setCaptcha(event.target.value); setError(""); }}
              maxLength={6}
              inputMode="numeric"
              placeholder="请输入：公众号，获取的验证码"
              className="mt-4 w-full rounded border border-[#1677ff] bg-white px-4 py-3 text-center text-lg font-bold tracking-normal text-[#0b1220] outline-none transition placeholder:font-bold placeholder:text-stone-500 focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]/20"
            />
            {error && <div className="mt-2 text-sm font-bold text-red-600">{error}</div>}
          </div>
        )}

        <div className="mt-5 flex justify-center gap-4">
          <button type="button" onClick={submitVerify} className={`rounded-lg px-7 py-3 text-lg font-bold text-white shadow-lg transition ${showVerify ? "bg-blue-600 shadow-blue-200 hover:bg-blue-500" : "bg-stone-500 shadow-stone-200 hover:bg-stone-600"}`}>{showVerify ? "提交验证" : "手动验证"}</button>
          <button type="button" onClick={onClose} className="rounded-lg border border-stone-200 bg-white px-7 py-3 text-lg font-bold text-stone-600 transition hover:bg-stone-50">残忍拒绝</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
