'use strict';
// Taxonomy: the published paper, Figure 9 (53 sub-dimensions; 29 embodiment-related).
const EVALUATION_DIMENSIONS = [
  {
    "id": "K",
    "name": {
      "en": "Knowledge",
      "zh": "知识"
    },
    "level": {
      "en": "Model-Level Probes",
      "zh": "模型级测试"
    },
    "title": {
      "en": "What does the model know?",
      "zh": "模型知道什么？"
    },
    "copy": {
      "en": "Test facts, concepts, and procedures in self-contained questions without tools.",
      "zh": "通过不调用工具的独立问题，测试事实、概念与方法知识。"
    },
    "items": [
      {
        "id": "K1",
        "sourceLabel": "world knowledge",
        "embodied": false,
        "name": {
          "en": "World Knowledge",
          "zh": "世界知识"
        },
        "definition": {
          "en": "Apply facts about everyday objects, living things, the physical world, and human society.",
          "zh": "运用有关日常物体、生命、自然世界与人类社会的事实知识。"
        }
      },
      {
        "id": "K2",
        "sourceLabel": "embodied knowledge",
        "embodied": true,
        "name": {
          "en": "Embodied Knowledge",
          "zh": "具身知识"
        },
        "definition": {
          "en": "Apply knowledge of physical properties, action effects, robot hardware, sensing, and kinematics.",
          "zh": "运用物性、动作效果、机器人硬件、传感与运动学知识。"
        }
      },
      {
        "id": "K3",
        "sourceLabel": "programming knowledge",
        "embodied": false,
        "name": {
          "en": "Programming Knowledge",
          "zh": "编程知识"
        },
        "definition": {
          "en": "Understand language semantics, algorithms, and software interfaces, and implement short functions.",
          "zh": "理解编程语言语义、算法与软件接口，并实现简短函数。"
        }
      }
    ]
  },
  {
    "id": "U",
    "name": {
      "en": "Understanding",
      "zh": "理解"
    },
    "level": {
      "en": "Model Probes + System Evidence",
      "zh": "模型测试与系统证据"
    },
    "title": {
      "en": "What is happening now?",
      "zh": "现在发生了什么？"
    },
    "copy": {
      "en": "Build a task-relevant representation from observations of the world, the user, and the body.",
      "zh": "根据世界、用户与身体的观测，形成与任务相关的状态表示。"
    },
    "items": [
      {
        "id": "U1",
        "sourceLabel": "perception and semantics",
        "embodied": false,
        "name": {
          "en": "Perception and Semantics",
          "zh": "感知与语义"
        },
        "definition": {
          "en": "Recognize objects, attributes, and task-relevant entities from multimodal observations.",
          "zh": "从多模态观测中识别物体、属性，以及与任务相关的实体。"
        }
      },
      {
        "id": "U2",
        "sourceLabel": "space and frames",
        "embodied": true,
        "name": {
          "en": "Space and Frames",
          "zh": "空间与参考系"
        },
        "definition": {
          "en": "Infer positions, geometry, and spatial relations across viewpoints and coordinate frames.",
          "zh": "跨视角与坐标系推断位置、几何结构和空间关系。"
        }
      },
      {
        "id": "U3",
        "sourceLabel": "physics",
        "embodied": true,
        "name": {
          "en": "Physics",
          "zh": "物理状态与机制"
        },
        "definition": {
          "en": "Identify physical states, support and contact relations, and mechanisms that affect interaction.",
          "zh": "识别物理状态、支撑与接触关系，以及影响交互的机制。"
        }
      },
      {
        "id": "U4",
        "sourceLabel": "affordance",
        "embodied": true,
        "name": {
          "en": "Affordance",
          "zh": "可供性"
        },
        "definition": {
          "en": "Identify which interactions are physically feasible with the observed scene and available capabilities.",
          "zh": "结合观测到的场景与已有能力，判断哪些交互在物理上可行。"
        }
      },
      {
        "id": "U5",
        "sourceLabel": "events",
        "embodied": false,
        "name": {
          "en": "Events",
          "zh": "事件"
        },
        "definition": {
          "en": "Recognize events, their order, and temporal dependencies from a sequence of observations.",
          "zh": "从连续观测中识别事件、先后顺序与时间依赖。"
        }
      },
      {
        "id": "U6",
        "sourceLabel": "goals and constraints",
        "embodied": false,
        "name": {
          "en": "Goals and Constraints",
          "zh": "目标与约束"
        },
        "definition": {
          "en": "Interpret the requested goal, desired state, and stated constraints before choosing a plan.",
          "zh": "在选择计划前，理解请求中的目标、期望状态与明确约束。"
        }
      },
      {
        "id": "U7",
        "sourceLabel": "human context",
        "embodied": false,
        "name": {
          "en": "Human Context",
          "zh": "人类交互情境"
        },
        "definition": {
          "en": "Recognize human activities, behaviorally expressed intentions, and the current interaction stage.",
          "zh": "识别人类活动、通过可观测行为表达的意图，以及当前交互阶段。"
        }
      },
      {
        "id": "U8",
        "sourceLabel": "body and capabilities",
        "embodied": true,
        "name": {
          "en": "Body and Capabilities",
          "zh": "本体与能力"
        },
        "definition": {
          "en": "Infer the robot’s body state, kinematics, reachable workspace, and the capabilities and constraints of available S1 skills and S0 control interfaces.",
          "zh": "推断机器人的本体状态、运动学、可达工作空间，以及可用 S1 技能和 S0 控制接口的能力与约束。"
        }
      },
      {
        "id": "U9",
        "sourceLabel": "progress and outcome",
        "embodied": true,
        "name": {
          "en": "Progress and Outcome",
          "zh": "进度与结果"
        },
        "definition": {
          "en": "Estimate completed steps, remaining work, and whether the intended physical effect occurred.",
          "zh": "判断已完成步骤、剩余工作，以及预期物理效果是否发生。"
        }
      },
      {
        "id": "U10",
        "sourceLabel": "uncertainty",
        "embodied": true,
        "name": {
          "en": "Uncertainty",
          "zh": "不确定性"
        },
        "definition": {
          "en": "Distinguish observed facts from inferred or unavailable information and recognize when evidence is insufficient.",
          "zh": "区分观测事实、推断信息与不可获得的信息，并识别证据不足的情况。"
        }
      }
    ]
  },
  {
    "id": "R",
    "name": {
      "en": "Reasoning",
      "zh": "推理"
    },
    "level": {
      "en": "Model Probes + Closed-Loop Tests",
      "zh": "模型测试与闭环测试"
    },
    "title": {
      "en": "What should happen next?",
      "zh": "下一步该怎么做？"
    },
    "copy": {
      "en": "Choose and revise decisions under physical constraints.",
      "zh": "在物理约束下选择并调整决策。"
    },
    "items": [
      {
        "id": "R1",
        "sourceLabel": "intent",
        "embodied": false,
        "name": {
          "en": "Intent",
          "zh": "意图"
        },
        "definition": {
          "en": "Infer underspecified goals and decide whether to clarify them before acting.",
          "zh": "推断表达不完整的目标，并判断行动前是否需要澄清。"
        }
      },
      {
        "id": "R2",
        "sourceLabel": "causal prediction",
        "embodied": false,
        "name": {
          "en": "Causal Prediction",
          "zh": "因果预测"
        },
        "definition": {
          "en": "Predict action consequences, explain outcomes, and compare what would happen under alternatives.",
          "zh": "预测动作后果、解释已发生的结果，并比较不同选择可能产生的影响。"
        }
      },
      {
        "id": "R3",
        "sourceLabel": "planning",
        "embodied": false,
        "name": {
          "en": "Planning",
          "zh": "规划"
        },
        "definition": {
          "en": "Decompose a goal into feasible subgoals and order actions around dependencies and constraints.",
          "zh": "将目标分解为可行子目标，并依据依赖关系与约束安排行动顺序。"
        }
      },
      {
        "id": "R4",
        "sourceLabel": "exploration",
        "embodied": true,
        "name": {
          "en": "Exploration",
          "zh": "探索"
        },
        "definition": {
          "en": "Choose search locations and navigation subgoals that help find a target or reduce uncertainty.",
          "zh": "选择有助于找到目标或减少不确定性的搜索位置与导航子目标。"
        }
      },
      {
        "id": "R5",
        "sourceLabel": "skill orchestration",
        "embodied": false,
        "name": {
          "en": "Skill Orchestration",
          "zh": "技能编排"
        },
        "definition": {
          "en": "Select, sequence, and coordinate skills and tools to meet task dependencies and capability limits.",
          "zh": "根据任务依赖与能力限制，选择、排序并协调技能与工具。"
        }
      },
      {
        "id": "R6",
        "sourceLabel": "action inference",
        "embodied": true,
        "name": {
          "en": "Action Inference",
          "zh": "动作推断"
        },
        "definition": {
          "en": "Generate executable, goal-consistent poses, waypoints, trajectories, joint targets, or skill parameters that satisfy body, geometric, and environmental constraints.",
          "zh": "生成可执行、符合目标且满足本体、几何与环境约束的位姿、路点、轨迹、关节目标或技能参数。"
        }
      },
      {
        "id": "R7",
        "sourceLabel": "active perception and intervention",
        "embodied": false,
        "name": {
          "en": "Active Perception and Intervention",
          "zh": "主动感知与干预"
        },
        "definition": {
          "en": "Decide when to gather another observation and whether, when, and how to intervene.",
          "zh": "判断何时补充观测，以及是否、何时和如何介入正在进行的任务。"
        }
      },
      {
        "id": "R8",
        "sourceLabel": "recovery",
        "embodied": true,
        "name": {
          "en": "Recovery",
          "zh": "失败恢复"
        },
        "definition": {
          "en": "Diagnose a failed action and choose a correction that restores progress without repeating the failure.",
          "zh": "诊断动作失败的原因，选择能恢复进展且避免重复失败的修正方法。"
        }
      },
      {
        "id": "R9",
        "sourceLabel": "interruption",
        "embodied": true,
        "name": {
          "en": "Interruption",
          "zh": "打断与重调度"
        },
        "definition": {
          "en": "Revise plans after user interventions, environmental changes, or collaborator actions while preserving valid task progress.",
          "zh": "在用户介入、环境变化或协作者采取行动后调整计划，同时保留仍然有效的任务进展。"
        }
      }
    ]
  },
  {
    "id": "T",
    "name": {
      "en": "Tool Use",
      "zh": "工具使用"
    },
    "level": {
      "en": "System-Level Evaluation",
      "zh": "系统级评估"
    },
    "title": {
      "en": "Can it use its capabilities?",
      "zh": "能否正确使用能力？"
    },
    "copy": {
      "en": "Choose a tool, supply valid arguments, interpret its response, and check the effect.",
      "zh": "选择工具、给出有效参数、理解返回结果，并检查实际效果。"
    },
    "items": [
      {
        "id": "T1",
        "sourceLabel": "perception tools",
        "embodied": true,
        "name": {
          "en": "Perception Tools",
          "zh": "感知工具"
        },
        "definition": {
          "en": "Request the needed visual or geometric estimate and interpret its output in the correct frame.",
          "zh": "调用所需的视觉或几何估计，并在正确坐标系中理解返回结果。"
        }
      },
      {
        "id": "T2",
        "sourceLabel": "planning tools",
        "embodied": true,
        "name": {
          "en": "Planning Tools",
          "zh": "规划工具"
        },
        "definition": {
          "en": "Supply feasible motion targets and use planning results or failures to guide execution.",
          "zh": "提供可行的运动目标，并根据规划结果或失败反馈推进执行。"
        }
      },
      {
        "id": "T3",
        "sourceLabel": "action tools",
        "embodied": true,
        "name": {
          "en": "Action Tools",
          "zh": "动作工具"
        },
        "definition": {
          "en": "Delegate suitable subtasks to learned policies and monitor their actions, or issue direct-control commands that respect the body’s units, frames, and limits.",
          "zh": "将适合的子任务委派给学习策略并监测其动作，或发出符合本体单位、参考系与能力限制的直接控制指令。"
        }
      },
      {
        "id": "T4",
        "sourceLabel": "code",
        "embodied": false,
        "name": {
          "en": "Code",
          "zh": "代码"
        },
        "definition": {
          "en": "Compose available APIs into executable programs that handle feedback and failures and terminate appropriately.",
          "zh": "将可用 API 组合为可执行程序，处理反馈与失败，并适时终止。"
        }
      }
    ]
  },
  {
    "id": "M",
    "name": {
      "en": "Memory",
      "zh": "记忆"
    },
    "level": {
      "en": "System-Level Evaluation",
      "zh": "系统级评估"
    },
    "title": {
      "en": "What remains when the view changes?",
      "zh": "视野改变后，还记得什么？"
    },
    "copy": {
      "en": "Use information no longer present in the current observation.",
      "zh": "使用当前观测中已经不再出现的信息。"
    },
    "items": [
      {
        "id": "M1",
        "sourceLabel": "object",
        "embodied": true,
        "name": {
          "en": "Object",
          "zh": "对象记忆"
        },
        "definition": {
          "en": "Retain relevant object attributes when the object is no longer visible.",
          "zh": "在物体不再可见时，保留与任务相关的对象属性。"
        }
      },
      {
        "id": "M4",
        "sourceLabel": "spatial",
        "embodied": true,
        "name": {
          "en": "Spatial",
          "zh": "空间记忆"
        },
        "definition": {
          "en": "Retain object locations and environmental layout, replacing them when new evidence shows a change.",
          "zh": "记住物体位置与环境布局，并在新证据表明变化时更新它们。"
        }
      },
      {
        "id": "M5",
        "sourceLabel": "sequential",
        "embodied": false,
        "name": {
          "en": "Sequential",
          "zh": "顺序记忆"
        },
        "definition": {
          "en": "Retain the order of observations or steps needed to choose and execute later actions.",
          "zh": "记住观测或步骤的先后顺序，用于选择并执行后续动作。"
        }
      },
      {
        "id": "M6",
        "sourceLabel": "capacity",
        "embodied": false,
        "name": {
          "en": "Capacity",
          "zh": "记忆容量"
        },
        "definition": {
          "en": "Keep multiple task-relevant items available instead of retaining only the most recent one.",
          "zh": "同时保留多个与任务相关的信息项，而非只记住最近一项。"
        }
      },
      {
        "id": "M2",
        "sourceLabel": "body",
        "embodied": true,
        "name": {
          "en": "Body",
          "zh": "本体记忆"
        },
        "definition": {
          "en": "Retain information about the robot’s own body, including its kinematic configuration and action-relevant body relations.",
          "zh": "保留机器人自身的本体信息，包括运动学构型与动作相关的本体关系。"
        }
      },
      {
        "id": "M3",
        "sourceLabel": "user",
        "embodied": false,
        "name": {
          "en": "User",
          "zh": "用户记忆"
        },
        "definition": {
          "en": "Retain user preferences and interaction history that matter for later tasks.",
          "zh": "保留会影响后续任务的用户偏好与交互历史。"
        }
      }
    ]
  },
  {
    "id": "X",
    "name": {
      "en": "Cross-Embodiment",
      "zh": "跨本体"
    },
    "level": {
      "en": "System-Level Evaluation",
      "zh": "系统级评估"
    },
    "title": {
      "en": "Does the goal survive a change of body?",
      "zh": "换一个身体，还能完成目标吗？"
    },
    "copy": {
      "en": "Keep the objective fixed and evaluate transfer to another embodiment.",
      "zh": "固定目标，评估能力能否迁移到另一种本体。"
    },
    "items": [
      {
        "id": "X1",
        "sourceLabel": "task transfer performance",
        "embodied": true,
        "name": {
          "en": "Task Transfer Performance",
          "zh": "任务迁移表现"
        },
        "definition": {
          "en": "Compare task success, execution efficiency, and stability across bodies under the same objectives and matched scenes.",
          "zh": "在目标一致、场景匹配的条件下，比较不同本体的任务成功率、执行效率与稳定性。"
        }
      },
      {
        "id": "X2",
        "sourceLabel": "body understanding",
        "embodied": true,
        "name": {
          "en": "Body Understanding",
          "zh": "本体理解"
        },
        "definition": {
          "en": "Adapt action parameters and execution plans to the new body’s sensing, motion, and manipulation capabilities, including checks for environmental collisions and self-collisions.",
          "zh": "根据新本体的感知、运动与操作能力调整动作参数和执行计划，并重新检查环境碰撞与自碰撞风险。"
        }
      },
      {
        "id": "X3",
        "sourceLabel": "experience reuse",
        "embodied": true,
        "name": {
          "en": "Experience Reuse",
          "zh": "经验复用"
        },
        "definition": {
          "en": "Carry over applicable experience and skills, revise assumptions specific to the old body, and prevent outdated experience from disrupting execution on the new body.",
          "zh": "复用仍适用的经验与技能，修订依赖旧本体的假设，并避免过时经验干扰新本体上的执行。"
        }
      }
    ]
  },
  {
    "id": "S",
    "name": {
      "en": "Safety",
      "zh": "安全"
    },
    "level": {
      "en": "Across Model and System",
      "zh": "贯穿模型与系统"
    },
    "title": {
      "en": "Is the whole action chain safe?",
      "zh": "整个行动过程是否安全？"
    },
    "copy": {
      "en": "Evaluate recognition, prevention, execution, recovery, and interruption.",
      "zh": "评估风险识别、预防、执行、恢复与中断。"
    },
    "items": [
      {
        "id": "S1",
        "sourceLabel": "risk recognition",
        "embodied": false,
        "name": {
          "en": "Risk Recognition",
          "zh": "风险识别"
        },
        "definition": {
          "en": "Identify hazards involving objects, the environment, and nearby people.",
          "zh": "识别物体、环境与周围人员相关的风险。"
        }
      },
      {
        "id": "S2",
        "sourceLabel": "consequence prediction",
        "embodied": true,
        "name": {
          "en": "Consequence Prediction",
          "zh": "后果预测"
        },
        "definition": {
          "en": "Anticipate immediate and delayed harm, including how alternative actions change the risk.",
          "zh": "预判即时与延迟伤害，以及不同动作会如何改变风险。"
        }
      },
      {
        "id": "S3",
        "sourceLabel": "prudent decisions",
        "embodied": false,
        "name": {
          "en": "Prudent Decisions",
          "zh": "审慎决策"
        },
        "definition": {
          "en": "Choose execution, verification, assistance, or refusal according to evidence and capability limits.",
          "zh": "根据现有证据与能力边界，选择执行、核验、求助或拒绝。"
        }
      },
      {
        "id": "S4",
        "sourceLabel": "prevention before action",
        "embodied": true,
        "name": {
          "en": "Prevention Before Action",
          "zh": "行动前预防"
        },
        "definition": {
          "en": "Check preconditions and choose a safe action order before execution begins.",
          "zh": "执行前检查必要条件，并选择安全的行动顺序。"
        }
      },
      {
        "id": "S5",
        "sourceLabel": "dynamic replanning",
        "embodied": true,
        "name": {
          "en": "Dynamic Replanning",
          "zh": "动态重规划"
        },
        "definition": {
          "en": "Monitor execution and revise the plan when new feedback reveals a deviation or hazard.",
          "zh": "监测执行，在新反馈揭示偏差或危险时调整计划。"
        }
      },
      {
        "id": "S6",
        "sourceLabel": "safe recovery",
        "embodied": false,
        "name": {
          "en": "Safe Recovery",
          "zh": "安全恢复"
        },
        "definition": {
          "en": "Remove residual hazards and recover or terminate safely after an action or failure.",
          "zh": "在动作完成或失败后消除残余危险，并安全恢复或终止。"
        }
      },
      {
        "id": "S7",
        "sourceLabel": "real-time response",
        "embodied": true,
        "name": {
          "en": "Real-Time Response",
          "zh": "实时响应"
        },
        "definition": {
          "en": "Intervene effectively before the specified safety window closes.",
          "zh": "在规定的安全时间窗结束前作出有效干预。"
        }
      },
      {
        "id": "S8",
        "sourceLabel": "coordinated interruption",
        "embodied": true,
        "name": {
          "en": "Coordinated Interruption",
          "zh": "协同中断"
        },
        "definition": {
          "en": "Propagate constraints, cancel commands, and coordinate stopping or control handover.",
          "zh": "传递约束、取消指令，并协调停止或控制权交接。"
        }
      }
    ]
  },
  {
    "id": "E",
    "name": {
      "en": "Efficiency",
      "zh": "效率"
    },
    "level": {
      "en": "System-Level Evaluation",
      "zh": "系统级评估"
    },
    "title": {
      "en": "Does the decision arrive in time?",
      "zh": "决策来得及吗？"
    },
    "copy": {
      "en": "Measure end-to-end response time and computation under explicit budgets.",
      "zh": "在明确预算下测量端到端响应时间与计算开销。"
    },
    "items": [
      {
        "id": "E1",
        "sourceLabel": "latency",
        "embodied": false,
        "name": {
          "en": "Latency",
          "zh": "响应延迟"
        },
        "definition": {
          "en": "Measure elapsed time from observation to action across the full decision and execution path.",
          "zh": "沿完整决策与执行链，测量从获得观测到采取动作的耗时。"
        }
      },
      {
        "id": "E2",
        "sourceLabel": "call count",
        "embodied": false,
        "name": {
          "en": "Call Count",
          "zh": "调用次数"
        },
        "definition": {
          "en": "Count the model calls needed for each attempted task, including retries.",
          "zh": "统计每次任务尝试所需的模型调用次数，包括重试。"
        }
      },
      {
        "id": "E3",
        "sourceLabel": "reasoning budget",
        "embodied": false,
        "name": {
          "en": "Reasoning Budget",
          "zh": "推理预算"
        },
        "definition": {
          "en": "Specify the allowed reasoning effort, tokens, and time when comparing results.",
          "zh": "比较结果时明确允许使用的推理强度、token 数与时间。"
        }
      },
      {
        "id": "E5",
        "sourceLabel": "observation freshness",
        "embodied": true,
        "name": {
          "en": "Observation Freshness",
          "zh": "观测新鲜度"
        },
        "definition": {
          "en": "Measure the time from capture of the observation behind a decision until the resulting action takes effect.",
          "zh": "测量从采集决策所依据的观测，到相应动作生效所经过的时间。"
        }
      },
      {
        "id": "E6",
        "sourceLabel": "response deadline",
        "embodied": true,
        "name": {
          "en": "Response Deadline",
          "zh": "响应时限"
        },
        "definition": {
          "en": "Specify the latest time at which a decision can still support the intended physical response.",
          "zh": "明确决策最晚何时到达，才能支持预期的物理响应。"
        }
      },
      {
        "id": "E7",
        "sourceLabel": "timeout rate",
        "embodied": true,
        "name": {
          "en": "Timeout Rate",
          "zh": "超时比例"
        },
        "definition": {
          "en": "Report the fraction of attempts or decisions that exceed their specified time limit.",
          "zh": "报告超过规定时间限制的任务尝试或决策所占的比例。"
        }
      }
    ]
  },
  {
    "id": "C",
    "name": {
      "en": "Cost",
      "zh": "成本"
    },
    "level": {
      "en": "Resource Measurement",
      "zh": "资源衡量"
    },
    "title": {
      "en": "What does useful work cost?",
      "zh": "完成有用工作要花多少成本？"
    },
    "copy": {
      "en": "Report resources per attempt and per success, including failures and retries.",
      "zh": "报告每次尝试与每次成功的资源消耗，包括失败和重试。"
    },
    "items": [
      {
        "id": "C1",
        "sourceLabel": "tokens",
        "embodied": false,
        "name": {
          "en": "Tokens",
          "zh": "Token 用量"
        },
        "definition": {
          "en": "Count input and output tokens per attempt and per success, with cache usage identified.",
          "zh": "分别统计每次尝试与每次成功的输入、输出 token 用量，并注明缓存使用情况。"
        }
      },
      {
        "id": "C2",
        "sourceLabel": "API fees",
        "embodied": false,
        "name": {
          "en": "API Fees",
          "zh": "API 费用"
        },
        "definition": {
          "en": "Report API charges per attempt and per success using a stated pricing and cache-accounting basis.",
          "zh": "按明确的定价与缓存计费口径，报告每次尝试和每次成功的 API 费用。"
        }
      },
      {
        "id": "C3",
        "sourceLabel": "total task time",
        "embodied": false,
        "name": {
          "en": "Total Task Time",
          "zh": "任务总耗时"
        },
        "definition": {
          "en": "Measure total elapsed task time, including waiting, execution, failures, and retries.",
          "zh": "测量任务的总用时，包括等待、执行、失败与重试。"
        }
      },
      {
        "id": "C4",
        "sourceLabel": "robot occupancy time",
        "embodied": true,
        "name": {
          "en": "Robot Occupancy Time",
          "zh": "真机占用时间"
        },
        "definition": {
          "en": "Measure how long the physical robot is occupied by each attempt and successful task.",
          "zh": "测量每次尝试与每次成功任务实际占用机器人的时间。"
        }
      }
    ]
  }
];
