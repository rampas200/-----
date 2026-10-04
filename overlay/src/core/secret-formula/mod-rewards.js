// [AD Mod] 업적/챌린지 보너스 보상 데이터
// 각 항목: r(메모, ...보상) - 메모는 업적/챌린지 내용과 보상이 어떻게 이어지는지 짧게 설명한다.
// 보상 채널과 값의 의미는 core/mod-rewards.js의 MOD_REWARD_CHANNELS 참고.
// 영원 챌린지(EC)의 고정 값은 "완료 1회당" 값이며 완료 횟수만큼 쌓인다(곱은 거듭제곱, 합은 곱셈).

const ALL_TIERS = [1, 2, 3, 4, 5, 6, 7, 8];

const r = (note, ...parts) => ({ note, parts });

// 고정 값 보상
const AD = (tiers, value) => ({ channel: "adTierMult", tiers: Array.isArray(tiers) ? tiers : [tiers], value });
const ALL_AD = value => ({ channel: "adMult", value });
const TICK = value => ({ channel: "tickspeed", value });
const BUY10 = value => ({ channel: "buy10Add", value });
const START_AM = value => ({ channel: "startingAM", value });
const BOOST = value => ({ channel: "dimBoostPower", value });
const BOOST_COST = value => ({ channel: "dimBoostDiscount", value });
const GALAXY = value => ({ channel: "galaxyStrength", value });
const GALAXY_COST = value => ({ channel: "galaxyDiscount", value });
const SAC = value => ({ channel: "sacrificePower", value });
const IP = value => ({ channel: "ipMult", value });
const INFS = value => ({ channel: "infinitiesMult", value });
const ID = value => ({ channel: "idMult", value });
const REPL = value => ({ channel: "replicantiSpeed", value });
const EP = value => ({ channel: "epMult", value });
const ETERS = value => ({ channel: "eternitiesMult", value });
const TD = value => ({ channel: "tdMult", value });
const TP = value => ({ channel: "tpMult", value });
const DT = value => ({ channel: "dtMult", value });
const RM = value => ({ channel: "rmMult", value });
const GLYPH = value => ({ channel: "glyphLevel", value });
const BH = value => ({ channel: "blackHolePower", value });

// 게임 상태에 따라 값이 변하는 보상 (text에 효과 설명을 직접 쓴다)
const dyn = (channel, text, effect) => ({ channel, text, effect });
// 특정 반물질 차원에만 걸리는 동적 보상 (effect는 { tier }를 받는다)
const dynAD = (tiers, text, effect) => ({ channel: "adTierMult", tiers, text, effect });
// 특정 상황에서만 켜지는 보상
const when = (text, condition, part) => ({ ...part, when: text, condition });

const inAnyChallenge = () => Player.isInAntimatterChallenge;

export const modRewards = {
  achievement: {
    // 1행: N번째 반물질 차원 구매 -> 그 차원 강화
    11: r("첫 차원을 산 기념", AD(1, 2)),
    12: r("반물질 100개면 충분히 많다", AD(2, 2), START_AM(10)),
    13: r("3편은 결국 나온다", AD(3, 3)),
    14: r("살아남은 4개의 차원", AD([1, 2, 3, 4], 1.4)),
    15: r("5차원 펀치", AD(5, 5)),
    16: r("9번째는 못 샀지만 6번째는 샀다", AD(6, 2)),
    17: r("운이 아니라 실력으로 얻은 7", AD(7, 7)),
    18: r("8을 90도 돌리면 ∞", AD(8, 2), IP(2)),

    // 2행
    21: r("첫 무한 도달", IP(2)),
    22: r("가짜 뉴스도 많이 보면 힘이 된다",
      dyn("adMult", "본 뉴스 종류 25개마다 모든 반물질 차원 +×1 (최대 ×5)",
        () => Math.min(1 + NewsHandler.uniqueTickersSeen / 25, 5))),
    23: r("9번째 차원은 없으니 8번째를 더",
      dynAD([8], "8번째 반물질 차원을 99개 살 때마다 8번째 차원 +×1 (최대 ×9)",
        () => Math.min(1 + AntimatterDimension(8).bought / 99, 9))),
    24: r("종말에 대비한 반물질 비축", ALL_AD(2)),
    25: r("부스트를 최대로", BOOST(1.1)),
    26: r("거대한 벽이 조금 낮아진다", GALAXY_COST(5)),
    27: r("갤럭시 두 배", GALAXY(1.02)),
    28: r("쓸모없어 보여도 1번째 차원은 소중하다", AD(1, 3)),

    // 3행
    31: r("너프를 깜빡한 배율", ALL_AD(3.1)),
    32: r("신들이 기뻐한다", SAC(1.02)),
    33: r("무한이 꽤 많다", INFS(2)),
    34: r("8번째 차원 없이도 괜찮았다", AD([1, 2, 3, 4, 5, 6, 7], 1.5)),
    35: r("잠들지 않고 버틴 시간만큼",
      dyn("adMult", "실제 플레이 12시간마다 모든 반물질 차원 +×1 (최대 ×3)",
        () => Math.min(1 + player.records.realTimePlayed / 4.32e7, 3))),
    36: r("갤럭시 하나로 버틴 끈기", GALAXY(1.05)),
    37: r("빠른 무한", TICK(1.1)),
    38: r("희생 없이 갤럭시까지 간 8번째 차원", AD(8, 3)),

    // 4행
    41: r("DLC 없이 업그레이드 16개", IP(2)),
    42: r("초음속 생산", TICK(1.2)),
    43: r("차원 서열이 뒤집혔다",
      dynAD(ALL_TIERS, "높은 차원일수록 강해짐 (8번째 ×1.8 … 1번째 ×1.1)",
        ({ tier }) => 1 + tier / 10)),
    44: r("30초 동안의 폭주", TICK(1.3)),
    45: r("감자보다 빠르게", TICK(1.25)),
    46: r("8번째를 뺀 모든 차원이 1e12개", AD([1, 2, 3, 4, 5, 6, 7], 2)),
    47: r("챌린지 3개를 깬 강심장", when("챌린지 중", inAnyChallenge, ALL_AD(3))),
    48: r("일반 챌린지 12개 정복", ALL_AD(4)),

    // 5행
    51: r("무한의 한계를 돌파", IP(3)),
    52: r("자동 구매자는 10개씩 산다", BUY10(0.05)),
    53: r("모든 자동 구매자 최대화", BOOST_COST(2)),
    54: r("10분 안에 무한", START_AM(100)),
    55: r("1분 안에 무한", TICK(1.2)),
    56: r("C2와 달리 생산이 멈추지 않는다",
      when("무한 시작 3분 동안", () => Time.thisInfinity.totalMinutes < 3, ALL_AD(3))),
    57: r("신의 선물", SAC(1.03)),
    58: r("틱스피드 챌린지 정복", TICK(1.12)),

    // 6행
    61: r("대량 구매의 달인", BUY10(0.1)),
    62: r("아직 여기 있었구나", IP(2)),
    63: r("무한 파워의 시작", ID(3)),
    64: r("부스트도 갤럭시도 없이 챌린지 무한", AD([1, 2, 3, 4], 2)),
    65: r("챌린지 시간 합계 3분 미만", when("챌린지 중", inAnyChallenge, ALL_AD(5))),
    66: r("제곱 감자보다 빠르게", TICK(1.5)),
    67: r("첫 무한 챌린지 완료",
      dyn("ipMult", "완료한 무한 챌린지 1개당 IP +×0.5",
        () => 1 + InfinityChallenges.completed.length / 2)),
    68: r("C3를 10초 만에", AD(1, 5)),

    // 7행
    71: r("1번째 차원 하나로 무한 (ERROR 909)", AD(1, 9.09)),
    72: r("감당 못 할 만큼의 무한",
      dyn("adMult", "총 무한 횟수가 10배가 될 때마다 모든 반물질 차원 +×1",
        () => 1 + Currency.infinitiesTotal.value.plus(1).log10())),
    73: r("존재하지 않는 업적", ALL_AD(10)),
    74: r("챌린지 최고 기록 합계 5초 미만", when("챌린지 중", inAnyChallenge, ALL_AD(10))),
    75: r("새로운 차원???", ID(4)),
    76: r("차원 하나에 하루씩",
      dyn("adMult", "실제 플레이 하루마다 모든 반물질 차원 +×1 (최대 ×8)",
        () => Math.min(1 + player.records.realTimePlayed / 8.64e7, 8))),
    77: r("무한 파워 100만", ID(2)),
    78: r("눈 깜짝할 새 무한", INFS(2.5)),

    // 8행
    81: r("IC5를 15초 만에", BOOST_COST(1), TICK(1.15)),
    82: r("무한 챌린지 8개 정복", ID(8)),
    83: r("갤럭시 50개", GALAXY(1.05)),
    84: r("반물질이 남아돈다", START_AM(1e5)),
    85: r("모든 IP는 우리 것", IP(2)),
    86: r("시간을 구부리는 자", TICK(2)),
    87: r("무한 200만 번", INFS(2)),
    88: r("또 하나의 무한 드립 (∞ = 8)", SAC(1.04)),

    // 9행
    91: r("터무니없는 속도", TICK(1.5)),
    92: r("아무도 날 막을 수 없다", IP(2)),
    93: r("최대 출력", IP(3)),
    94: r("무한 파워 1e260", ID(2.6)),
    95: r("이거 안전한 거 맞아?", REPL(2)),
    96: r("시간은 상대적이다", EP(2)),
    97: r("레고를 밟는 고통", when("무한 챌린지 중", () => InfinityChallenge.isRunning, ALL_AD(6.66))),
    98: r("무한까지 0도", ID(3)),

    // 10행
    101: r("8번째 차원만으로 영원", AD(8, 100)),
    102: r("모든 영원 마일스톤 달성", ETERS(2)),
    103: r("IP 9.99e999", IP(10)),
    104: r("30초 안에 영원", EP(2)),
    105: r("무한한 시간 (틱스피드 업그레이드 308개)", TD(3.08)),
    106: r("레플리칸티 떼", REPL(1.5)),
    107: r("무한 10번 미만으로 영원", INFS(10)),
    108: r("레플리칸티 정확히 9개", REPL(1.9)),

    // 11행
    111: r("무한 안의 무한", IP(5)),
    112: r("다시는 안 해", ID(5)),
    113: r("영원은 새로운 무한", ETERS(2)),
    114: r("실패도 경험이다", EP(1.5)),
    115: r("영원을 7번 했더라면", ETERS(7)),
    116: r("무한 1번으로 영원", INFS(2)),
    117: r("코스트코에서 부스트 대량 구매", BOOST(1.075)),
    118: r("9000 이상이다!", SAC(1.05)),

    // 12행
    121: r("무한한 IP?", IP(8)),
    122: r("넌 이미 죽어 있다 (1번째 차원만으로 영원)", AD(1, 1000)),
    123: r("업데이트까지 영원 5번",
      dyn("epMult", "영원 챌린지 총 완료 횟수 1회당 EP +×0.1",
        () => 1 + EternityChallenges.completions / 10)),
    124: r("오래가는 관계", ID(6)),
    125: r("무한 없이 IP 1e90", IP(9)),
    126: r("인기 음악 (레플리칸티 갤럭시 180배)", REPL(1.8)),
    127: r("또 다른 프레스티지를 원했지만", EP(3)),
    128: r("시간 연구 없이 IP 1e22000", TD(5)),

    // 13행
    131: r("윤리적 소비는 없다", INFS(5)),
    132: r("특별한 눈송이", GALAXY(1.05)),
    133: r("무한 따위 원래 싫었어", EP(2)),
    134: r("언제쯤 충분할까", REPL(2)),
    135: r("감자^286078보다 빠르게", TICK(1e10)),
    136: r("시간을 팽창시켰다", TP(2)),
    137: r("팽창으로 생각하기", DT(2)),
    138: r("시간 연구 없이 팽창", TP(1.5)),

    // 14행
    141: r("현실로 돌아오다", RM(2)),
    142: r("오토메이터가 영원을 대신 돌려준다", ETERS(10)),
    143: r("리스킨을 좋아한다며", EP(10)),
    144: r("인터스텔라", BH(1.1)),
    145: r("간격과 지속시간이 뒤바뀐 블랙홀", BH(1.1)),
    146: r("모든 퍽 구매", GLYPH(5)),
    147: r("현실의 달인", RM(3)),
    148: r("로열 플러시", GLYPH(5)),

    // 15행
    151: r("8번째 차원 없이 갤럭시 800개", GALAXY(1.03)),
    152: r("글리프 100개", GLYPH(10)),
    153: r("반물질 없이 현실", RM(2)),
    154: r("나는 스피드", RM(1.5)),
    155: r("137억 년", BH(1.137)),
    156: r("대학 중퇴 (시간 정리 구매 없이 현실)", TD(100)),
    157: r("효과는 굉장했다!", GLYPH(4)),
    158: r("블랙홀 안에 있는 거야?", BH(1.1)),

    // 16행
    161: r("팽창 중 반물질 1e1e8", DT(3)),
    162: r("모든 시간 연구", EP(10)),
    163: r("모든 영원 챌린지를 1초 안에", ETERS(100)),
    164: r("무한 곱하기 2", INFS(2)),
    165: r("완벽한 균형", GLYPH(50)),
    166: r("나이스나이스", GLYPH(69)),
    167: r("명단에 없는 레이어", RM(2)),
    168: r("반쯤 왔다", RM(1.5)),

    // 17행
    171: r("신이 기뻐하신다 (글리프 희생)", GLYPH(10)),
    172: r("은하수를 여행하는 현실 안내서 (42)", RM(4.2)),
    173: r("존재하지 않는 업적 III", RM(3)),
    174: r("특이점 도달", DT(2)),
    175: r("최초의 반역사가", RM(2)),
    176: r("엄마가 셋 셌다", DT(3)),
    177: r("천체의 마일스톤", GLYPH(30)),
    178: r("세계의 파괴자 (갤럭시 10만 개)", GALAXY(1.01)),

    // 18행 (Pelle)
    181: r("영원한 반물질 차원", ALL_AD(10)),
    182: r("한 번만 더 (자동 구매자 복구)", TICK(10)),
    183: r("데자뷰 (Pelle 안의 IC5)", GALAXY(1.05)),
    184: r("스트라이크 3, 아웃!", REPL(3)),
    185: r("87년 전 (네 번째 스트라이크)", DT(4)),
    186: r("건강하지 못한 집착", IP(10)),
    187: r("팽창 시간과 함께", DT(2)),
    188: r("끝까지 함께해 줘서 고마워요", ALL_AD(2), IP(2), EP(2)),
  },

  secret: {
    11: r("첫 업적은 공짜", START_AM(10)),
    12: r("만일을 대비한 저장 100번", ALL_AD(1.1)),
    13: r("존중의 대가", IP(1.1)),
    14: r("나도", ALL_AD(1.05)),
    15: r("배럴 롤!", TICK(1.05)),
    16: r("고통을 즐기는 자", EP(1.1)),
    17: r("목숨 30개", ALL_AD(1.3)),
    18: r("운이 좋은 날 (행운의 7)", ALL_AD(1.77)),
    21: r("현실에서 공부하세요", TD(1.1)),
    22: r("이모지로 튀긴 갤럭시", GALAXY(1.01)),
    23: r("콘솔을 연 범죄자", ALL_AD(1.1)),
    24: r("진짜 뉴스", ALL_AD(1.1)),
    25: r("비밀 테마 발견", IP(1.1)),
    26: r("실패의 아이콘", EP(1.1)),
    27: r("물질도 무한하다", ALL_AD(1.1)),
    28: r("나이스.", ALL_AD(1.069)),
    31: r("RAM을 더 다운로드", TICK(1.02)),
    32: r("0.001초 이하", INFS(1.1)),
    33: r("건전한 금융 결정", IP(1.1)),
    34: r("빈 연구 트리 초기화", TD(1.1)),
    35: r("최대 구매를 알려줘야 할까", TICK(1.05)),
    36: r("자리를 비운 사이 아무 일도 없었다", START_AM(10)),
    37: r("지시를 따랐다", ALL_AD(1.1)),
    38: r("칼날 위에서 멈춘 초기화", START_AM(10)),
    41: r("존재하지 않는 9번째 차원", AD(8, 1.1)),
    42: r("EC12로 시간 가속 시도", TICK(1.01)),
    43: r("불협화음 합창", GLYPH(1)),
    44: r("통계를 뚫어지게", ALL_AD(1.15)),
    45: r("퍽 끌기", RM(1.05)),
    46: r("비 오는 날을 위해 시간 저장", BH(1.01)),
    47: r("모든 탭 숨기기", ALL_AD(1.1)),
    48: r("스택 오버플로 (오토메이터 오류)", ETERS(1.1)),
  },

  normalChallenge: {
    1: r("첫 무한", AD(1, 2)),
    2: r("C2와 반대로, 무한 직후 생산 폭발",
      dyn("adMult", "무한 시작 직후 모든 반물질 차원 ×3, 3분에 걸쳐 ×1로 줄어듦",
        () => Math.max(3 - 2 * player.records.thisInfinity.time / 180000, 1))),
    3: r("C3의 점점 커지는 배율",
      dynAD([1], "이번 무한에서 1분마다 1번째 반물질 차원 +×1 (최대 ×10)",
        () => Math.min(1 + player.records.thisInfinity.time / 60000, 10))),
    4: r("하위 차원을 지우던 C4 → 희생 강화", SAC(1.03)),
    5: r("약한 틱스피드를 갤럭시로 보완", GALAXY(1.05)),
    6: r("하위 차원으로 값을 치르던 C6", AD([1, 2, 3, 4, 5, 6], 1.5)),
    7: r("10개 구매 배율이 약했던 C7", BUY10(0.1)),
    8: r("희생만 믿었던 C8", SAC(1.05)),
    9: r("가격이 같이 오르던 틱스피드 챌린지", TICK(1.2)),
    10: r("차원이 6개뿐이던 C10", BOOST_COST(2)),
    11: r("물질이 차오르던 C11", GALAXY_COST(5)),
    12: r("두 단계 아래를 생산하던 C12", AD([2, 4, 6], 2), IP(1.5)),
  },

  infinityChallenge: {
    1: r("모든 챌린지를 한꺼번에", when("챌린지 중", inAnyChallenge, ALL_AD(10))),
    2: r("자동 희생", SAC(1.05)),
    3: r("틱스피드 구매가 곧 배율",
      dyn("adMult", "틱스피드 구매 1회마다 모든 반물질 차원 ×1.005 (최대 ×1e20)",
        () => Decimal.pow(1.005, player.totalTickBought).clampMax(1e20))),
    4: r("마지막에 산 차원만 정상이던 IC4",
      dynAD(ALL_TIERS, "높은 차원일수록 강해짐 (8번째 ×3 … 1번째 ×1.25)",
        ({ tier }) => 1 + tier / 4)),
    5: r("가격이 뒤엉키던 IC5", GALAXY(1.03), GALAXY_COST(3)),
    6: r("물질이 배율을 나누던 IC6", ID(3)),
    7: r("갤럭시 없이 부스트만", BOOST(1.25)),
    8: r("구매해야 생산이 유지되던 IC8",
      when("최근 10초 안에 구매했다면",
        () => player.records.thisInfinity.time - player.records.thisInfinity.lastBuyTime < 10000, ALL_AD(3))),
  },

  // 완료 1회당 값, 최대 5회
  eternityChallenge: {
    1: r("시간 차원 없이", TD(3)),
    2: r("무한 차원 없이", ID(3)),
    3: r("5~8번째 차원이 멈췄던 EC3", AD([5, 6, 7, 8], 10)),
    4: r("무한 횟수 제한", IP(3)),
    5: r("갤럭시 비용이 바로 치솟던 EC5", GALAXY_COST(4), BOOST_COST(1)),
    6: r("반물질 갤럭시를 못 얻던 EC6", GALAXY(1.01)),
    7: r("차원이 뒤엉켜 생산하던 EC7", TD(2)),
    8: r("업그레이드 횟수 제한", REPL(1.3)),
    9: r("틱스피드 구매 금지", TICK(100)),
    10: r("무한 횟수가 힘이던 EC10", INFS(2)),
    11: r("부스트만 남았던 EC11", BOOST(1.05)),
    12: r("1000배 느린 시간", EP(2)),
  },
};
