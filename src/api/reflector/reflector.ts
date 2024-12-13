export async function listEvents(): Promise<{ form: Form[], visit: Visit[], binding: Binding[] }> {
    const form = [
        { id: 0, name: "访视日期", page: 1 },
        { id: 1, name: "知情同意书", page: 2 },
        { id: 2, name: "人口统计学资料", page: 3 },
        { id: 3, name: "过敏史", page: 4 },
        { id: 4, name: "烟酒史", page: 5 },
        { id: 5, name: "胸部CT", page: 6 },
        { id: 6, name: "生命体征", page: 7 },
        { id: 7, name: "全面体格检查", page: 8 },
        { id: 8, name: "12导联心电图", page: 9 },
        { id: 9, name: "血常规", page: 10 },
        { id: 10, name: "尿常规与尿细胞定量", page: 11 },
        { id: 11, name: "血生化", page: 12 },
        { id: 12, name: "凝血功能", page: 13 },
        { id: 13, name: "妊娠检查", page: 14 },
        { id: 14, name: "病毒学检查", page: 15 },
        { id: 15, name: "不良事件/严重不良事件评估", page: 16 },
        { id: 16, name: "既往/合并非药物治疗", page: 17 },
        { id: 17, name: "既往病史/现病史", page: 18 },
    ];
    const visit = [
        { id: 0, name: "V1筛选期（D-35 ~D-1）" },
        { id: 1, name: "V2第0周（D1）" },
        { id: 2, name: "V3第2周（D15）" },
        { id: 3, name: "V4第4周（D29）" },
        { id: 4, name: "V4第6周（D43）" },
        { id: 5, name: "V5第8周（D57）" },
        { id: 6, name: "V6第12周（D85）" },
        { id: 7, name: "V6第14周（D99）" },
        { id: 8, name: "V7第16周（D113）" },
        { id: 9, name: "V7第18周（D127）" },
        { id: 10, name: "V8第20周（D141）" },
        { id: 11, name: "V8第22周（D155）" },
        { id: 12, name: "V9第24周（D169）" },
        { id: 13, name: "V9第26周（D183）" },
        { id: 14, name: "V10第28周（D197）" },
        { id: 15, name: "Running Record" },
    ];
    const binding = [
        { parent: 0, children: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
        { parent: 1, children: [0] },
        { parent: 2, children: [0] },
        { parent: 3, children: [0] },
        { parent: 4, children: [0] },
        { parent: 5, children: [0] },
        { parent: 6, children: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
        { parent: 7, children: [0, 1] },
        { parent: 8, children: [0, 8] },
        { parent: 9, children: [0, 1, 3, 5, 7, 9, 13] },
        { parent: 10, children: [0, 1, 3, 5, 7, 9, 13] },
        { parent: 11, children: [0, 1, 3, 5, 7, 9, 13] },
        { parent: 12, children: [0, 1, 3, 5, 7, 9, 13] },
        { parent: 13, children: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
        { parent: 14, children: [0] },
        { parent: 15, children: [15] },
        { parent: 16, children: [15] },
        { parent: 17, children: [15] },
    ]
    return {
        form,
        visit,
        binding,
    }
}

export interface Form {
    id: number,
    name: string,
    page: number,
}

export interface Visit {
    id: number,
    name: string,
}

export interface Binding {
    parent: number,
    children: number[],
}

