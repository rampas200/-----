// [AD Mod] 모드 시간 연구: 원래 트리 아래에 붙는 4갈래 × 10단계 연구
// 연구 자체는 원래 시간 연구 데이터베이스에 들어 있다 (secret-formula/eternity/time-studies/mod-time-studies.js).
// 여기서는 트리 화면 배치, 연결선, Shift+클릭 연속 구매처럼 원래 코드가 행 번호(id/10)에 기대는 부분을 맡는다.

import { MOD_STUDY_BRANCHES, modTimeStudies } from "./secret-formula/eternity/time-studies/mod-time-studies";

const DEPTH = 10;
const modStudyIds = new Set(modTimeStudies.map(config => config.id));

function branchOf(id) {
  return MOD_STUDY_BRANCHES.find(branch => id >= branch.firstId && id < branch.firstId + DEPTH);
}

export const ModTimeStudies = {
  branches: MOD_STUDY_BRANCHES,
  depth: DEPTH,

  // 꺼져 있거나 스피드런 중이면 트리에서 숨기고 살 수도 없다
  get isEnabled() {
    return ADMod.modStudies && !ADMod.isSuspended;
  },

  isModStudy(id) {
    return modStudyIds.has(id);
  },

  // 트리의 한 줄: 갈래 순서대로 같은 단계의 연구 id
  rowIds(depth) {
    return MOD_STUDY_BRANCHES.map(branch => branch.firstId + depth);
  },

  // 갈래 안에서 위아래 연구를 잇는 연결선 (화면에 보일 때만 만든다. 없는 연구를 잇으면 배치 계산이 깨진다)
  connections() {
    if (!this.isEnabled) return [];
    const connections = [];
    for (const branch of MOD_STUDY_BRANCHES) {
      for (let depth = 1; depth < DEPTH; depth++) {
        const id = branch.firstId + depth;
        connections.push(new TimeStudyConnection(TimeStudy(id - 1), TimeStudy(id)));
      }
    }
    return connections;
  },

  // Shift+클릭: 갈래의 시작 조건이 되는 원래 연구까지 산 다음, 갈래 맨 위부터 누른 연구까지 차례로 산다
  purchaseChain(id) {
    const branch = branchOf(id);
    const chain = [...buyStudiesUntil(branch.rootStudy)];
    for (let studyId = branch.firstId; studyId <= id; studyId++) chain.push(studyId);
    TimeStudyTree.commitToGameState(chain);
  },
};
