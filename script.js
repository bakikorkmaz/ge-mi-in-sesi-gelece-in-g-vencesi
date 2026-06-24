/**
 * Akıllı Şehir İyileşme Modeli - Baki Korkmaz
 * Gelişmiş Deterministik Simülasyon Motoru (Maliyet-Fayda Analizi ve Optimizasyon)
 */

let gercekBinaVerileri = [];

function loadBinaVerileri() {
    try {
        if (typeof gercekBinaVerileriRaw === 'undefined') {
            throw new Error("data.js yüklenemedi veya gercekBinaVerileriRaw bulunamadı.");
        }
        
        const lines = gercekBinaVerileriRaw.trim().split('\n');
        
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 5) { // Maliyet Katsayısı eklendi
                gercekBinaVerileri.push({
                    yasi: parseInt(cols[1]),
                    zemin: parseInt(cols[2]),
                    kat: parseInt(cols[3]),
                    maliyet_katsayisi: parseFloat(cols[4])
                });
            }
        }
        console.log(`AFAD 2026 tabanlı ${gercekBinaVerileri.length} bina verisi başarıyla yüklendi.`);
        
        initAdiyamanScenario();
        initIstanbulSimulator();
    } catch (e) {
        console.error("Veri yüklenirken hata oluştu:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadBinaVerileri();
});

// Kurtarma Süresi Hesaplama
function calculateTotalRecovery(bina_sayisi, butce_milyon_tl, ekip_sayisi) {
    let toplam_is_yuku_saat = 0;
    ekip_sayisi = Math.max(1, ekip_sayisi);
    
    const bina_basina_butce = (butce_milyon_tl * 1000000) / bina_sayisi;
    const guclendirme_faktoru = 1 / (1 + (bina_basina_butce / 250000));
    const secilen_binalar = gercekBinaVerileri.slice(0, bina_sayisi);
    
    for (const bina of secilen_binalar) {
        let temel_hasar = (bina.yasi * 1.2) + ((5 - bina.zemin) * 8) + (bina.kat * 3);
        let guncel_hasar = temel_hasar * guclendirme_faktoru;
        guncel_hasar = Math.max(0, Math.min(100, guncel_hasar));
        
        let is_yuku = 0;
        if (guncel_hasar < 20) {
            is_yuku = 2; 
        } else if (guncel_hasar < 50) {
            is_yuku = 24 + guncel_hasar * 0.5; 
        } else {
            is_yuku = 72 + guncel_hasar * 2.5; 
        }
        
        toplam_is_yuku_saat += is_yuku;
    }
    
    const verimlilik = ekip_sayisi > 100 ? Math.max(0.6, 1 - (ekip_sayisi * 0.0005)) : 1.0;
    const lojistik_gecikme = 6; 
    
    const toplam_kurtarma_suresi = (toplam_is_yuku_saat / (ekip_sayisi * verimlilik)) + lojistik_gecikme;
    return Math.max(0, toplam_kurtarma_suresi);
}

// Yeni: Maliyet-Fayda Hesaplaması (Gerçekçi Verilerle Detaylandırıldı)
function calculateCostBenefit(bina_sayisi, butce_milyon_tl, ekip_sayisi, currentRecTime) {
    // Toplam Maliyet Detaylandırması (Gerçekçi Veriler - 2026)
    
    // 1. İş Makinesi / Kepçe (10 personele 1 kepçe düşer varsayımı)
    const kepce_sayisi = Math.ceil(ekip_sayisi / 10);
    // Kepçe saati ortalama 3,000 TL = 0.003 Milyon TL. Toplam Kepçe Maliyeti:
    const maliyet_kepce = kepce_sayisi * currentRecTime * 0.003;
    
    // 2. Personel ve Lojistik (Günlük 2,500 TL personel + 1,500 TL lojistik/gıda = 4,000 TL = 0.004 Milyon TL)
    // Süreyi güne çevirerek (currentRecTime / 24) hesaplıyoruz
    const gun_sayisi = Math.max(1, currentRecTime / 24);
    const maliyet_personel = ekip_sayisi * gun_sayisi * 0.004;
    
    // 3. Güçlendirme Bütçesi (Doğrudan Milyon TL)
    const maliyet_butce = butce_milyon_tl;
    
    const toplam_maliyet = maliyet_kepce + maliyet_personel + maliyet_butce;
    
    // Baseline (Referans Noktası: Bütçe yok, sadece 10 minimum ekip var)
    const baselineRecTime = calculateTotalRecovery(bina_sayisi, 0, 10);
    
    // Kazanılan zaman
    const kazanilan_zaman = baselineRecTime - currentRecTime;
    
    // Fayda Oranı = Kazanılan Zaman / Toplam Maliyet
    // Eğer maliyet çok düşükse sıfıra bölünmeyi engelle
    const oran = toplam_maliyet > 0 ? (kazanilan_zaman / toplam_maliyet) : 0;
    
    // Skoru 0-100 arasına çekme ve harf notu verme
    let skor = 0;
    if (oran > 0) {
        // Logaritmik bir skorlama (Azalan verimler yasasına uygun)
        skor = Math.min(100, Math.max(0, (Math.log(oran * 10 + 1) / Math.log(500)) * 100));
    }
    
    // Çok fazla bütçe basılmış ama süre 24 saatin altındaysa (gereksiz para israfı)
    if (currentRecTime < 24 && toplam_maliyet > (bina_sayisi * 0.5)) {
        skor -= 20; // Aşırı kaynak israfı cezası
    }
    
    skor = Math.max(0, Math.min(100, skor));
    
    let harf = "F";
    let durum = "Çok Verimsiz Kaynak Kullanımı";
    if (skor >= 85) { harf = "A+"; durum = "Optimum Maliyet-Fayda"; }
    else if (skor >= 70) { harf = "B"; durum = "İyi Seviye Verimlilik"; }
    else if (skor >= 50) { harf = "C"; durum = "Ortalama Verimlilik"; }
    else if (skor >= 30) { harf = "D"; durum = "Düşük Verimlilik"; }
    
    if (toplam_maliyet < 10) { harf = "F"; durum = "Yetersiz Kaynak Tahsisi"; skor = 0; }
    
    return { 
        toplam_maliyet, 
        skor, 
        harf, 
        durum,
        kepce_sayisi,
        maliyet_kepce,
        maliyet_personel,
        maliyet_butce
    };
}

function initAdiyamanScenario() {
    const bina = 1000;
    const butce = 0;
    const ekip = 50;

    const recTimeHours = calculateTotalRecovery(bina, butce, ekip);

    const recLabel = document.getElementById('adiyaman-rec');
    if (recLabel) {
        if (recTimeHours > 72) {
            recLabel.textContent = (recTimeHours / 24).toFixed(0) + " Gün";
        } else {
            recLabel.textContent = recTimeHours.toFixed(1) + " Saat";
        }
    }
}

function initIstanbulSimulator() {
    const rangeBina = document.getElementById('rangeBina');
    const rangeButce = document.getElementById('rangeButce');
    const rangeEkip = document.getElementById('rangeEkip');

    const lblBina = document.getElementById('lblBina');
    const lblButce = document.getElementById('lblButce');
    const lblEkip = document.getElementById('lblEkip');
    
    const lblRecTime = document.getElementById('lblRecoveryTime');
    const lblRecUnit = document.getElementById('lblRecoveryUnit');
    const lblTotalCost = document.getElementById('lblTotalCost');
    const lblEffScore = document.getElementById('lblEffScore');
    const lblEffGrade = document.getElementById('lblEffGrade');
    const lblEffStatus = document.getElementById('lblEffStatus');
    const progressEff = document.getElementById('progressEff');

    function updateSimulation() {
        const bina = parseInt(rangeBina.value);
        const butce = parseInt(rangeButce.value);
        const ekip = parseInt(rangeEkip.value);

        lblBina.textContent = bina;
        lblButce.textContent = butce;
        lblEkip.textContent = ekip;

        // Süre Hesaplama
        const recTimeHours = calculateTotalRecovery(bina, butce, ekip);
        
        let displayValue = 0;
        if (recTimeHours > 72) {
            displayValue = recTimeHours / 24;
            lblRecUnit.textContent = "Gün";
        } else {
            displayValue = recTimeHours;
            lblRecUnit.textContent = "Saat";
        }
        lblRecTime.textContent = displayValue.toFixed(1);

        if (recTimeHours > 24 * 10) {
            lblRecTime.style.color = "var(--danger)";
            lblRecTime.style.textShadow = "0 0 20px rgba(239, 68, 68, 0.4)";
        } else if (recTimeHours > 24 * 3) {
            lblRecTime.style.color = "var(--warning)";
            lblRecTime.style.textShadow = "0 0 20px rgba(245, 158, 11, 0.4)";
        } else {
            lblRecTime.style.color = "var(--primary)";
            lblRecTime.style.textShadow = "0 0 20px var(--primary-glow)";
        }

        // Maliyet-Fayda Hesaplama
        if (lblTotalCost) {
            const cb = calculateCostBenefit(bina, butce, ekip, recTimeHours);
            lblTotalCost.textContent = cb.toplam_maliyet.toFixed(1) + " Milyon TL";
            
            // Detaylar
            const lblExcavatorCount = document.getElementById('lblExcavatorCount');
            const lblCostMachinery = document.getElementById('lblCostMachinery');
            const lblCostPersonnel = document.getElementById('lblCostPersonnel');
            const lblCostBudget = document.getElementById('lblCostBudget');
            
            if (lblExcavatorCount) lblExcavatorCount.textContent = cb.kepce_sayisi;
            if (lblCostMachinery) lblCostMachinery.textContent = cb.maliyet_kepce.toFixed(2);
            if (lblCostPersonnel) lblCostPersonnel.textContent = cb.maliyet_personel.toFixed(2);
            if (lblCostBudget) lblCostBudget.textContent = cb.maliyet_butce.toFixed(1);
            
            lblEffScore.textContent = cb.skor.toFixed(0);
            lblEffGrade.textContent = cb.harf;
            lblEffStatus.textContent = cb.durum;
            progressEff.style.width = cb.skor + "%";
            
            // Renkleri ayarla
            if (cb.harf === "A+") {
                lblEffGrade.style.color = "var(--primary)";
                progressEff.style.background = "var(--primary)";
            } else if (cb.harf === "B" || cb.harf === "C") {
                lblEffGrade.style.color = "var(--warning)";
                progressEff.style.background = "var(--warning)";
            } else {
                lblEffGrade.style.color = "var(--danger)";
                progressEff.style.background = "var(--danger)";
            }
        }
    }

    rangeBina.addEventListener('input', updateSimulation);
    rangeButce.addEventListener('input', updateSimulation);
    rangeEkip.addEventListener('input', updateSimulation);

    updateSimulation();
}
