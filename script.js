/**
 * 線上擲筊核心邏輯
 */

document.addEventListener('DOMContentLoaded', () => {
    const throwBtn = document.getElementById('throw-btn');
    const resultArea = document.getElementById('result-area');
    const resultTitle = document.getElementById('result-title');
    const resultDesc = document.getElementById('result-desc');

    const blockLeft = document.querySelector('#block-left .moon-block');
    const blockRight = document.querySelector('#block-right .moon-block');
    const shadowLeft = document.getElementById('shadow-left');
    const shadowRight = document.getElementById('shadow-right');

    /**
     * 動態建立立體厚度的筊杯物件
     */
    function build3DBlocks() {
        const blocks = document.querySelectorAll('.moon-block');
        blocks.forEach(block => {
            // 清除原有的元素
            block.innerHTML = '';

            // 建立平坦面 (陽面面下) - 模擬紅色漆器質感
            const flatFace = document.createElement('div');
            flatFace.className = 'face flat-face';
            block.appendChild(flatFace);

            /**
             * 透過高達 100 層的堆疊，建立圓弧凸表面 (陰面面上)
             */
            const layers = 100;
            const maxZ = 75;

            for (let i = 1; i <= layers; i++) {
                const layer = document.createElement('div');
                layer.className = 'face edge-face';

                // 每個層級的 Z 座標
                const z = (i / layers) * maxZ;

                // 比例與位移：透過微小的位移產生有機的斜度變化
                const ratio = i / layers;
                const scale = Math.sqrt(1 - Math.pow(ratio, 2.8));
                const offset = Math.sin(ratio * Math.PI) * 2.5;

                // 高級光影渲染 (漆器紅 + 鏡面高光)
                let l;
                let s = 95;
                if (ratio < 0.7) {
                    l = 6 + (ratio * 25); // 極暗到鮮紅
                } else if (ratio < 0.95) {
                    const sub = (ratio - 0.7) / 0.25;
                    l = 31 + (sub * 25); // 受光鮮紅
                } else {
                    const spec = (ratio - 0.95) / 0.05;
                    l = 56 + (spec * 40); // 頂部高亮
                    s = 95 - (spec * 70); // 亮點趨向白色
                }

                layer.style.backgroundColor = `hsl(0, ${s}%, ${l}%)`;
                if (i === 1) layer.style.boxShadow = '0 0 20px rgba(0,0,0,0.8)';
                layer.style.transform = `translateZ(${-z}px) scale(${scale}) translateX(${offset}px)`;

                block.appendChild(layer);
            }
        });
    }

    // 初始化 3D 結構
    build3DBlocks();

    // 擲筊結果列舉
    const RESULTS = {
        SHENG: { title: '聖筊', desc: '一平一凸：神明同意您的請求，事情會順利發展。' },
        XIAO: { title: '笑筊', desc: '兩平向下：神明笑而不答。可能代表問題不清楚、機緣未到，或神明認為已有定數不需再問。' },
        YIN: { title: '陰筊', desc: '兩凸向上（又稱蓋筊）：神明不認同、不同意，或表示前方有阻礙、宜三思而後行。' }
    };

    /**
     * 擲筊動畫與邏輯
     */
    async function throwBlocks() {
        // 1. 鎖定按鈕與隱藏舊結果
        throwBtn.disabled = true;
        resultArea.classList.remove('show');

        // 稍作等待以確實隱藏
        await new Promise(resolve => setTimeout(resolve, 300));

        // 2. 計算結果 (0: 平, 1: 凸)
        const leftValue = Math.round(Math.random());
        const rightValue = Math.round(Math.random());

        // 3. 處理動畫：加入動態的 3D 翻轉，確保停下來的時候是正確的面
        // 我們利用 rotateX 數圈與 rotateY 來做翻滾。
        // 若值為 0 (平)，向上代表正面，Y旋轉應為 0 家族（如 0, 360, 720...）
        // 若值為 1 (凸)，向上代表背面，Y旋轉應為 180 家族（如 180, 540...）

        // 基礎旋轉圈數 (至少轉3圈)
        const baseYRotates = 1080; // 3圈

        // 左筊杯目標旋轉
        const leftTargetRotY = baseYRotates + (leftValue === 1 ? 180 : 0);
        // 右筊杯目標旋轉 (多加一點度數可以有不對稱感)
        const rightTargetRotY = baseYRotates + 360 + (rightValue === 1 ? 180 : 0);

        // 加上 X 與 Z 軸的隨機微調，讓它看起來是凌空拋起
        // 這裡我們直接利用 element.animate API 達成複雜動畫，而最後停留在我們要的 transform

        const animationConfig = {
            duration: 1800,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards'
        };

        // 隨機散開的位移量 (散開感)
        const leftScatterX = Math.random() * 140 - 70;
        const leftScatterZ = Math.random() * 80 - 40;
        const rightScatterX = Math.random() * 140 - 70;
        const rightScatterZ = Math.random() * 80 - 40;

        // --- 核心動畫：物體與地面陰影的聯動 ---
        // 左筊
        const leftAnim = blockLeft.animate([
            { transform: 'translateY(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
            { transform: `translateY(-240px) rotateX(${1080 + Math.random() * 360}deg) rotateY(${leftTargetRotY / 2}deg) rotateZ(${Math.random() * 360}deg)`, offset: 0.5 },
            { transform: `translateY(0) translateX(${leftScatterX}px) translateZ(${leftScatterZ}px) rotateX(10deg) rotateY(${leftTargetRotY}deg) rotateZ(${Math.random() * 180 - 90}deg)` }
        ], animationConfig);

        const leftShadowAnim = shadowLeft.animate([
            { transform: 'translateX(-50%) scale(1)', opacity: 0.6, filter: 'blur(8px)' },
            { transform: 'translateX(-50%) scale(1.8)', opacity: 0.2, filter: 'blur(20px)', offset: 0.5 },
            { transform: `translateX(calc(-50% + ${leftScatterX}px)) scale(0.9)`, opacity: 0.8, filter: 'blur(4px)' }
        ], animationConfig);

        // 右筊
        const rightAnim = blockRight.animate([
            { transform: 'translateY(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
            { transform: `translateY(-240px) rotateX(${1080 + Math.random() * 360}deg) rotateY(${rightTargetRotY / 2}deg) rotateZ(${Math.random() * 360}deg)`, offset: 0.5 },
            { transform: `translateY(0) translateX(${rightScatterX}px) translateZ(${rightScatterZ}px) rotateX(10deg) rotateY(${rightTargetRotY}deg) rotateZ(${Math.random() * 180 - 90}deg)` }
        ], animationConfig);

        const rightShadowAnim = shadowRight.animate([
            { transform: 'translateX(-50%) scale(1)', opacity: 0.6, filter: 'blur(8px)' },
            { transform: 'translateX(-50%) scale(1.8)', opacity: 0.2, filter: 'blur(20px)', offset: 0.5 },
            { transform: `translateX(calc(-50% + ${rightScatterX}px)) scale(0.9)`, opacity: 0.8, filter: 'blur(4px)' }
        ], animationConfig);

        // 等待動畫結束
        await Promise.all([leftAnim.finished, rightAnim.finished]);

        // 4. 計算與顯示結果
        let finalResult;

        // 判斷邏輯
        if (leftValue !== rightValue) {
            // 一平一凸
            finalResult = RESULTS.SHENG;
            resultTitle.style.color = '#4CAF50'; // 綠色
        } else if (leftValue === 0 && rightValue === 0) {
            // 兩平
            finalResult = RESULTS.XIAO;
            resultTitle.style.color = '#FFC107'; // 黃/橘色
        } else {
            // 兩凸 (1,1)
            finalResult = RESULTS.YIN;
            resultTitle.style.color = '#F44336'; // 紅色
        }

        // 更新 DOM
        resultTitle.textContent = finalResult.title;
        resultDesc.textContent = finalResult.desc;

        // 顯示結果
        resultArea.classList.add('show');

        // 5. 恢復按鈕
        throwBtn.disabled = false;
    }

    // 綁定點擊事件
    throwBtn.addEventListener('click', () => {
        try {
            throwBlocks();
        } catch (error) {
            console.error("擲筊過程中發生錯誤:", error);
            alert("抱歉，發生了一點錯誤，請重試！");
            throwBtn.disabled = false;
        }
    });
});
