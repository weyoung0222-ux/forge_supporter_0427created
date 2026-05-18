# 용어사전

## 목적

프로젝트에서 공통으로 사용하는 핵심 용어를 동일한 의미로 이해할 수 있도록 정의한다.

본 문서는 데이터베이스 컬럼명 표준화를 위한 표준 단어, 표준 용어, 표준 도메인 정의서가 아니라, **Physical AI Platform**의 기획, 분석, 설계, 개발 과정에서 공통으로 사용할 주요 개념과 용어의 의미를 정리한 플랫폼 용어 사전이다.

## 작성 기준

1. 현재 단계에서는 Physical AI Platform 관점의 용어를 우선 정리한다.
2. 용어 표제어는 **영문** 기준으로 작성하고, 설명과 사용 예시는 **한국어**로 작성한다.
3. 기능/프로세스 용어, 세부 구현 용어, 화면 문구 등은 계속 확장한다.

## 구성

문서는 아래 구분에 따라 용어를 묶어 정리한다.

### 구성 분류

| 구분 | 내용 |
| --- | --- |
| 주요 용어 | Physical AI Platform 설명에서 우선적으로 사용되는 주요 개념어 |
| 보조 용어 | 주요 용어를 이해하거나 관리하기 위해 함께 사용하는 하위 개념, 관리 단위, 기술 개념 |
| 프로세스 용어 | 플랫폼에서 수행하는 주요 행위나 처리 절차 |
| 공통 플랫폼 용어 | 계정, 조직, 권한, 테넌트, 운영 관리와 관련된 공통 플랫폼 용어 |

---

## 주요 용어

Physical AI Platform 설명에서 우선적으로 사용되는 용어를 정의한다.

### 주요 용어 목록

| No | 용어 | 설명 | 사용 예시 | 비고 |
| --- | --- | --- | --- | --- |
| 1 | Physical AI | 물리 세계를 인지하고 이해하며 추론하고, 센서와 액추에이터를 통해 실제 환경과 상호작용하거나 행동을 수행할 수 있도록 만드는 AI 전반을 가리키는 상위 개념이다.<br>로봇, 자율주행, 비전 에이전트, 스마트 공간처럼 실제 환경에서 작동하는 autonomous system을 포함하며, 이 플랫폼이 다루는 최상위 문제 영역을 설명할 때 사용한다. | physical AI 개발을 위한 데이터와 모델을 준비한다. | 플랫폼 상위 개념 |
| 2 | Project | 특정 환경과 업무 목표를 전제로, 로봇이 수행해야 하는 작업 시나리오를 정의하는 플랫폼의 최상위 단위이다.<br>하나의 project는 단순한 폴더나 팀 구분이 아니라, 로봇이 어떤 환경에서 무엇을 해야 하는지를 설명하는 시나리오 컨텍스트를 가지며, 관련 data, dataset, model, execution, artifact 등을 함께 관리한다. | 특정 환경과 작업 목표를 하나의 project로 정의한다. | 플랫폼 최상위 시나리오/업무 단위 |
| 3 | Data | Physical AI 개발 과정에서 수집, 생성, 변환, 학습, 평가에 사용되는 정보 단위 전반을 의미한다.<br>이미지, 비디오, action, state, annotation, metadata처럼 모델 학습이나 실행에 활용되는 입력, 중간 결과, 출력 결과를 포함한다. | 비디오, action, state 모두 data에 포함된다. | Dataset을 구성하는 재료이자 상위 개념 |
| 4 | Dataset | Physical AI 개발에 사용할 수 있도록 특정 목적과 구조에 맞게 조직된 data의 집합이다.<br>단순 파일 묶음이 아니라, 학습, 생성, 증강, 평가 등 용도에 맞게 포맷, 메타정보, 버전, 품질 상태와 함께 관리되는 단위를 의미한다. | 생성, 학습, 평가에 사용할 dataset을 관리한다. | Data보다 더 구체적인 관리 단위 |
| 5 | Model | 입력 data를 처리해 예측, 판단, 생성, 제어 신호 등 특정 출력을 만들어내도록 정의된 AI 구성 단위이다.<br>학습 전에는 구조와 초기 파라미터를 가진 학습 대상 model로 존재할 수 있고, 학습 결과는 파일 또는 상태로 저장될 수 있다. 플랫폼에서 사용, 비교, 배포 대상으로 등록되면 관리 대상이 될 수 있다.<br>Physical AI Platform에서는 생성, 추출, 증강, 평가, 학습 흐름에서 선택되거나 학습 대상으로 사용된다. | 신규 model을 학습하거나, 기존 학습 model을 추가 학습하고, 생성 또는 평가에 사용할 model을 선택한다. | 세부 모델 관리 용어는 별도 검토 |
| 6 | Robot | 특정 robot model을 기반으로 플랫폼에 등록한 로봇 구성 단위이다.<br>실제 물리 로봇 개체 자체라기보다는 제어 방식, 자유도, 관절 메타데이터, URDF, modality 설정, 장착 장치 구성 등 로봇을 실행, 시뮬레이션, 학습 데이터 해석에 사용하기 위한 기준 정보를 포함한다.<br>실제 현장에 존재하는 개별 로봇은 robot instance로 구분한다. | project에서 사용할 robot을 선택한다. | robot model과 robot instance 사이의 구성 단위 |
| 7 | Robot Model | 로봇의 기종, 제품군, 형태 분류, 대표 이미지, 제조사 등 로봇을 식별하기 위한 기준 모델 카탈로그이다.<br>특정 robot을 정의할 때 기준이 되며, 필요에 따라 URDF, modality schema 같은 기술 자산과 연결될 수 있다. | Unitree G1 robot model을 등록한다. | robot 정의의 기준 모델 |
| 8 | Robot Instance | 특정 robot 구성을 기반으로 현장 또는 운영 환경에 등록된 개별 물리 로봇 개체이다.<br>같은 robot을 기반으로 하더라도 여러 robot instance가 존재할 수 있으며, 각 instance는 serial number, instance name, 연결 설정, 운영 상태, 설명 등 독립적인 식별 정보와 운영 맥락을 가진다. | 현장에 배치된 robot instance의 상태를 확인한다. | 실제 개별 로봇 개체 |
| 9 | Task | 로봇이 수행해야 하는 작업 목표 또는 행동 목표이다.<br>데이터 수집, 생성, 증강, 추출, 학습, 평가 흐름 모두에서 작업의 목적을 설명하는 공통 기준으로 사용된다. | pick and place task를 선택한다. | project 안에서 정의되는 작업 목표 단위 |
| 10 | Modality | 모델이 입력 또는 출력으로 요구하는 데이터 유형과 구성이다.<br>vision, language, action, state처럼 모델이 처리하는 데이터 채널을 설명할 때 사용한다. 하나의 modality 안에서도 multi-view처럼 여러 시점이나 센서 구성이 존재할 수 있다. | vision, action, state modality를 확인한다. | multi-view와 구분 필요 |
| 11 | Vision | 이미지, 비디오, 카메라 view, depth 등 시각 정보를 포함하는 modality이다.<br>로봇의 작업 환경, 객체, 상태 변화를 관측하기 위한 입력으로 사용되며, single-view 또는 multi-view 구성으로 제공될 수 있다. | vision data로 작업 장면을 입력한다. | image, video, camera view 포함 |
| 12 | Action | 로봇이 수행하는 제어 신호 또는 행동 표현이다.<br>학습의 target으로 사용되기도 하고, IDM처럼 관측으로부터 추출되는 결과가 되기도 하며, 로봇이 실제로 무엇을 했는지를 나타내는 핵심 개념이다. | 비디오에서 action을 추출한다. | action data의 핵심 개념 |
| 13 | State | 로봇이나 환경의 현재 상태를 표현하는 정보이다.<br>로봇의 자세, 관절값, 말단 장치 상태, 센서 상태 등이 포함될 수 있으며, 학습, 제어, 평가 과정에서 action을 해석하거나 예측하기 위한 입력 또는 조건 정보로 사용된다. | state는 학습 입력으로 사용된다. | action과 함께 trajectory를 구성 |
| 14 | Simulation | 로봇과 환경을 가상으로 실행하고 검증하는 환경 또는 실행 맥락이다.<br>데이터 생성과 증강, 모델 평가, policy 검증 등에서 활용되며, 실제 로봇 실행 전 실험 환경의 역할도 가진다. | simulation에서 모델을 평가한다. | generation, augmentation, evaluation과 연결 |
| 15 | Environment | 로봇이 task를 수행하는 물리적 또는 시뮬레이션 공간과 그 주변 조건을 의미한다.<br>편의점 내부, 물류센터, 제조 공정 구역, 설비 주변처럼 작업이 일어나는 장소뿐 아니라 배치된 객체, 설비, 조명, 장애물, 작업 제약 조건 등 task 수행에 영향을 주는 상황 정보를 포함할 수 있다. | 물류센터 피킹 존을 environment로 정의한다. | task가 수행되는 공간/상황 조건 |
| 16 | Workflow | 데이터 생성, action 추출, 데이터 변환/증강, 모델 학습, 모델 평가처럼 플랫폼에서 수행하는 하나 이상의 처리 단계를 연결한 절차이다.<br>하나의 workflow는 단일 기능 실행일 수도 있고, 여러 단계를 연결한 end-to-end pipeline일 수도 있다.<br>workflow를 어떤 입력과 조건으로 수행할지는 job으로 관리하고, 실제 수행 이력은 execution과 artifact로 관리한다. | data generation부터 model evaluation까지 workflow로 구성한다. | job, execution, artifact의 상위 실행 절차 |
| 17 | Job | 특정 workflow를 수행하기 위해 입력, 파라미터, 자원 조건, 실행 설정을 묶어 생성한 작업 관리 단위이다.<br>하나의 job은 큐잉, 스케줄링, 재실행, 상태 추적, 결과 artifact 연결의 기준이 될 수 있으며, 실제 수행 이력은 execution으로 구분한다. | generation job에 입력 video와 생성 파라미터를 설정한다. | workflow 수행 조건을 담는 작업 관리 단위 |
| 18 | Execution | job이 실제로 한 번 수행된 실행 기록 또는 실행 인스턴스이다.<br>같은 job이라도 재실행되면 여러 execution이 생길 수 있으며, 각 execution은 상태, 로그, 산출물, 실패 이력 등을 가진다. | execution status를 확인한다. | pending, running, failed 같은 상태 포함 |
| 19 | Artifact | 실행 결과로 생성, 저장, 재사용되는 산출물이다.<br>생성된 비디오, 추출된 action data, 변환된 dataset, 학습 결과 파일, 평가 리포트처럼 이후 단계에서 다시 참조될 수 있는 결과물을 포괄한다. | 생성된 비디오를 artifact로 저장한다. | video, action data, dataset, report 포함 가능 |
| 20 | Synthetic Data | 실제 현장에서 직접 수집한 데이터가 아니라, 시뮬레이션, 생성 모델, 규칙 기반 생성 등을 통해 만든 학습용 또는 검증용 data이다.<br>비용, 위험, 희귀 시나리오 부족 문제를 보완하기 위해 Physical AI 개발에서 사용된다. | synthetic data로 long-tail scenario를 보완한다. | data generation, augmentation과 연결 |

---

## 보조 용어

주요 용어를 이해하거나 관리하기 위해 함께 사용하는 하위 개념, 관리 단위, 기술 개념을 정의한다.

### 보조 용어 목록

| No | 용어 | 설명 | 사용 예시 | 비고 |
| --- | --- | --- | --- | --- |
| 1 | Dataset Format | dataset을 저장하고 교환하기 위해 사용하는 구조화된 파일 형식 또는 스키마이다.<br>플랫폼에서는 ROS bag, RLDS, HDF5, LeRobot처럼 로봇 데이터의 시간축, 센서값, 비디오, action, state, metadata를 담을 수 있는 여러 format을 다룰 수 있다. | dataset format을 LeRobot으로 변환한다. | dataset의 하위 관리 개념 |
| 2 | Dataset Version | 특정 시점의 dataset 상태를 식별하고 재현할 수 있도록 관리하는 버전 단위이다.<br>데이터 추가, 변환, annotation, validation, format 변환 등으로 dataset 내용이나 메타정보가 바뀔 때 이전 상태와 구분하기 위해 사용한다. | 학습에 사용한 dataset version을 기록한다. | 재현성, 추적성, 비교에 필요 |
| 3 | Model Architecture | model의 입력, 출력, 네트워크 구조, 파라미터 구성, modality 처리 방식 등을 정의하는 설계 단위이다.<br>아직 학습되지 않은 상태에서도 model architecture는 존재할 수 있으며, 학습이 진행되면 이 구조 위에 파라미터가 조정되어 구체화된다. | RFM 학습에 사용할 model architecture를 선택한다. | 학습 가중치가 아닌 구조/설계 개념 |
| 4 | Checkpoint | model 학습 과정의 특정 시점에 저장된 파라미터 상태 또는 학습 상태이다.<br>학습 재개, 추가 학습, 평가, 추론 실행의 출발점으로 사용할 수 있으며, model 자체보다는 특정 학습 시점의 저장 결과에 가깝다. | fine-tuning을 시작할 checkpoint를 선택한다. | model의 특정 학습 상태 |
| 5 | Model Version | 플랫폼에서 model을 재현, 비교, 선택, 배포할 수 있도록 식별하는 관리 버전 단위이다.<br>model version은 특정 model 자산의 버전으로서 학습 dataset version, 평가 결과, 실행 설정, 지원 modality 등 모델을 사용하거나 재현하는 데 필요한 메타정보를 함께 관리할 수 있다. | 평가에 사용할 model version을 고정한다. | model의 하위 관리 개념 |
| 6 | Experiment | 무엇을 비교하거나 검증할 것인지를 정의하고, 같은 목적이나 가설을 가진 여러 execution을 묶어 비교하기 위한 실험 관리 단위이다.<br>입력 dataset, 학습 파라미터, 평가 metric, artifact, model version 등을 함께 비교해 어떤 조건이 더 적합한지 판단하는 데 사용한다. | pick and place fine-tuning experiment에서 learning rate별 execution 결과를 비교한다. | 비교 질문을 가진 execution 묶음. 실제 실행 단위인 execution과 구분 |
| 7 | Run | ML 실험관리나 외부 MLOps 도구에서 하나의 학습, 평가, pipeline 실행을 추적하는 단위로 사용되는 용어이다.<br>플랫폼 내부 표준 실행 단위는 execution으로 두되, MLflow, W&B, Kubeflow, Vertex AI처럼 experiment와 run 개념을 사용하는 도구와 연동하거나 화면 표시 용어를 검토할 때 run을 참조할 수 있다. | 외부 MLflow run id를 execution과 매핑한다. | 내부 표준 용어는 execution |
| 8 | Robot Device Model | 로봇에 장착하거나 연결할 수 있는 장치의 모델 카탈로그이다.<br>gripper, hand, wrist camera, depth camera, LiDAR, force-torque sensor처럼 재사용 가능한 장치 모델의 유형, 제조사, 모델 번호, 사양 정보를 관리한다. | Inspire Hand를 robot device model로 등록한다. | 장치 카탈로그 단위 |
| 9 | Robot Device | 특정 robot에 robot device model을 장착하거나 연결한 구성 정보이다.<br>장착 위치, 필수 여부, 표시 순서, robot별 설정 등을 포함할 수 있으며, 물리 장치 자체보다는 robot 구성 안에서 device model이 어떻게 사용되는지를 나타낸다. | robot에 wrist camera device를 장착한다. | robot과 robot device model의 연결 구성 |
| 10 | Task Group | 하나의 project 안에서 관련 task를 묶는 중간 단위이다.<br>공정 단계, 작업 구간, 준비/수행/정리 단계처럼 사람이 이해하기 쉬운 업무 흐름을 기준으로 여러 task를 그룹화할 때 사용한다. | 활물질 투입 project에서 이송 준비, bag 취급, 투입 단계를 task group으로 나눈다. | project와 task 사이의 선택적 중간 단위 |
| 11 | Skill | 하나의 task를 수행하기 위해 필요한 세부 행동 능력 또는 조작 능력 단위이다.<br>grasp, lift, move, place처럼 더 작은 행동 요소로 task를 구성하거나 모델의 capability를 설명할 때 사용된다. | pick and place task는 grasp와 place 같은 skill로 나눌 수 있다. | task의 하위 단위. 학습 단위로 사용할지 검토 필요 |
| 12 | Embodiment | 로봇이나 에이전트가 물리 세계에서 행동하기 위해 가지는 신체적 형태와 상호작용 조건을 의미한다.<br>Physical AI에서는 관절 구성, 말단 장치, 센서 배치, action space, state schema처럼 모델이 행동을 생성하거나 데이터를 해석할 때 전제하는 몸체 조건을 설명할 때 사용한다. | embodiment에 따라 required modality와 action space가 달라진다. | 학습/모델 관점의 몸체 조건 |
| 13 | Robot Foundation Model | 여러 robot, task, environment, modality data를 폭넓게 학습해 로봇 작업에 재사용할 수 있도록 만든 foundation model 계열이다.<br>특정 task 하나만 수행하도록 처음부터 학습한 전용 model과 달리, 다양한 로봇 작업의 기반 능력을 가지고 있다가 특정 robot, environment, task에 맞게 fine-tuning 또는 post-training될 수 있다.<br>플랫폼에서는 로봇 모델 학습, 평가, 배포의 주요 대상이 될 수 있지만, 핵심 관리 단위로는 상위 용어인 Model에 포함된다. | GR00T 계열 robot foundation model을 특정 project의 pick and place task dataset으로 fine-tuning한다. | 약어는 RFM. 로봇 도메인/용도 기준의 모델 범주이다. VLA model은 RFM이 구현되는 대표적인 구조일 수 있지만, 두 용어를 완전히 같은 뜻으로 고정하지 않는다. |
| 14 | Vision-Language-Action Model | vision data와 language instruction을 입력으로 받아 robot action, trajectory, control command 같은 행동 출력을 생성하는 multimodal model 구조이다.<br>예를 들어 카메라 image로 현재 장면을 보고, "컵을 집어서 선반에 올려라" 같은 지시를 이해한 뒤, 로봇이 수행할 action을 출력하는 모델을 의미한다.<br>필요에 따라 state, proprioception, tactile data 같은 추가 modality를 함께 사용할 수 있다. | VLA model이 front camera image와 task instruction을 입력받아 gripper action과 arm trajectory를 생성한다. | 약어는 VLA Model. 현재 문서에서는 개념 설명 용어로만 사용한다. 충분히 범용적으로 학습된 VLA는 RFM의 한 형태가 될 수 있다. |
| 15 | Dataset Lineage | dataset이 어떤 원본 data, source dataset version, workflow, job, execution, artifact로부터 만들어졌는지를 추적하는 관계 정보이다.<br>기존 dataset을 직접 수정하지 않고 WFM, IDM, Mimic, format 변환, curation 등을 통해 신규 dataset을 만들 때 원본과 파생 결과의 관계를 기록하는 데 사용한다. | WFM으로 생성한 synthetic video dataset에 source dataset version과 generation execution을 lineage로 기록한다. | version은 같은 dataset의 변경 이력이고, lineage는 서로 다른 dataset 사이의 파생 관계를 설명한다. |
| 16 | Episode | 로봇이나 policy가 하나의 task 또는 scenario를 시작 조건부터 종료 조건까지 수행한 한 번의 실행 단위이다.<br>dataset에서는 하나의 학습 또는 평가 sample 단위로 사용될 수 있으며, 성공/실패 여부, 종료 사유, 길이, metadata, trajectory 등을 포함할 수 있다. | pick and place task의 성공 episode와 실패 episode를 비교한다. | episode는 한 번의 수행 단위이고, trajectory는 그 안에 기록된 시간 순서 데이터이다. |
| 17 | Trajectory | 로봇이 task를 수행하는 동안 시간 순서대로 기록된 상태와 행동의 궤적이다.<br>여기서 궤적은 단순 파일 경로나 공간상 이동 경로가 아니라, observation, state, action, pose, metadata 등이 시간축을 따라 이어진 sequence를 의미한다.<br>demonstration, simulation rollout, policy evaluation 결과를 설명하는 기본 단위가 될 수 있다. | 하나의 episode 안에서 frame별 state와 action trajectory를 확인한다. | episode가 한 번의 수행 단위라면, trajectory는 그 수행 안에서 시간 순서로 기록된 상태/행동 궤적이다. |
| 18 | Policy | observation, state, goal, instruction 같은 입력을 바탕으로 robot이 수행할 action을 결정하는 행동 결정 규칙 또는 model이다.<br>학습된 policy는 특정 task에서 로봇이 어떤 행동을 선택할지 정의하며, imitation learning, reinforcement learning, model fine-tuning, simulation evaluation에서 공통으로 등장한다. | 학습된 policy를 simulation에서 평가한다. | model과 겹칠 수 있으나, policy는 특히 action 선택/행동 결정 기능에 초점을 둔다. |

---

## 프로세스 용어

플랫폼에서 수행하는 주요 행위나 처리 절차를 정의한다.

### 프로세스 용어 목록 (1–11)

| No | 용어 | 설명 | 사용 예시 | 비고 |
| --- | --- | --- | --- | --- |
| 1 | Data Collection | 실물 로봇, 시뮬레이터, teleoperation, 센서 또는 외부 시스템으로부터 Physical AI 개발에 필요한 원천 data를 수집하는 과정이다.<br>수집 대상에는 video, image, sensor log, action, state, metadata 등이 포함될 수 있다. | teleoperation으로 robot demonstration data collection을 수행한다. | dataset 구축의 시작 프로세스 |
| 2 | Data Ingestion | 외부 또는 로컬에 존재하는 data를 플랫폼 저장소와 관리 체계 안으로 가져오는 과정이다.<br>파일 업로드, dataset import, object storage 연계, 기본 metadata 추출 등을 포함할 수 있다. | 작업자가 수집한 rosbag file을 data ingestion으로 플랫폼에 가져온다. | upload/import를 포괄 |
| 3 | Data Generation | 학습, 평가, 시뮬레이션 등에 활용할 data를 새로 생성하는 과정이다.<br>생성 모델, 시뮬레이터, 규칙 기반 생성기 등을 활용해 vision, action, state, metadata 등 필요한 data를 만들거나 보완하는 흐름을 의미할 수 있다. | 생성 모델을 이용해 synthetic video data generation을 수행한다. | workflow를 구성하는 주요 프로세스 |
| 4 | Action Extraction | 입력 video 또는 demonstration에서 robot action을 추출하는 과정이다.<br>관측 데이터와 action 추출 모델을 활용해 로봇이 수행한 행동 표현을 생성하거나 보완하는 흐름을 의미한다. | 입력 video에서 action extraction을 수행한다. | video-to-action 계열 프로세스 |
| 5 | Data Augmentation | 기존 dataset 또는 demonstration을 기반으로 변형, 확장, 재생성하여 학습에 사용할 data를 늘리거나 다양화하는 과정이다.<br>시뮬레이션, 재생성 모델, 규칙 기반 변형 등을 통해 부족한 상황이나 변형 케이스를 보완할 수 있다. | source demonstration dataset으로 data augmentation을 수행한다. | dataset 확장 프로세스 |
| 6 | Data Preprocessing | 본 처리나 학습 전에 data를 필요한 형식과 구조로 정리하는 과정이다.<br>format 변환, frame 정렬, metadata 정리, 결측 확인, 기본 형식/스키마 확인, 후속 workflow 입력 구조 변환처럼 처리 가능한 상태로 만드는 작업을 포함한다. | 학습 전에 source dataset을 preprocessing한다. | 기본 validation 성격의 확인을 포함할 수 있음 |
| 7 | Annotation | data에 task, subtask, object, time segment, label 등 의미 정보를 부여하는 과정이다.<br>모델 학습이나 데이터 증강, 평가에서 필요한 기준 정보를 만들기 위해 수동 또는 자동으로 수행될 수 있다. | demonstration에 subtask annotation을 추가한다. | 데이터 준비 프로세스 |
| 8 | Dataset Assembly | 수집, 생성, 추출, 변환된 data를 학습이나 평가에 사용할 수 있는 dataset 구조로 묶는 과정이다.<br>video, action, state, annotation, metadata를 episode, frame, sample 단위로 정렬하고 하나의 dataset으로 구성하는 작업을 포함한다. | video, action, state를 묶어 dataset assembly를 수행한다. | dataset 생성의 조립 단계 |
| 9 | Data Curation | 수집되거나 생성된 data 또는 dataset을 목적에 맞게 선별하고 재구성하는 과정이다.<br>여러 dataset을 merge하거나, 하나의 dataset을 train/validation/test 용도로 split하거나, 조건에 맞는 sample을 filtering하여 학습 또는 평가에 사용할 dataset 구성을 만드는 작업을 포함한다. | 학습용 dataset을 만들기 위해 여러 dataset을 merge하고 split한다. | dataset 구성 관리 프로세스 |
| 10 | Data Evaluation | data 또는 dataset의 품질, 다양성, 커버리지, 균형, 학습/평가 적합성을 판단하는 과정이다.<br>sample 품질, annotation 신뢰도, scenario 분포, long-tail case 포함 여부 등을 확인하여 dataset의 사용 가치를 평가한다. | 학습 전에 dataset에 대한 data evaluation을 수행한다. | 데이터 품질/가치 판단 프로세스 |
| 11 | Dataset Registration | 조립되거나 검수된 dataset을 플랫폼의 Data Manager 또는 dataset catalog에서 관리할 수 있도록 등록하는 과정이다.<br>dataset name, format, version, source, lineage, validation result 같은 관리 metadata를 함께 기록할 수 있다. | 생성된 demonstration dataset을 dataset registration으로 등록한다. | Data Manager 관리 진입점 |

### 프로세스 용어 목록 (12–22)

| No | 용어 | 설명 | 사용 예시 | 비고 |
| --- | --- | --- | --- | --- |
| 12 | Training | dataset을 이용해 model의 파라미터나 동작 방식을 조정하는 전체 학습 과정이다.<br>신규 model을 처음부터 학습할 수도 있고, 기존 model을 특정 목적에 맞게 추가 학습할 수도 있다. | 선택한 dataset으로 robot policy model training을 수행한다. | model 개발의 상위 프로세스 |
| 13 | Imitation Learning | expert demonstration으로부터 policy를 학습하는 방식이다.<br>demonstration은 사람, 기존 robot, expert policy, simulation 등이 수행한 trajectory일 수 있으며, 일반적으로 observation 또는 state와 그에 대응하는 action의 쌍을 이용해 원하는 행동을 재현하도록 학습한다.<br>Physical AI Platform에서는 teleoperation demonstration이나 Mimic으로 생성한 demonstration을 이용해 task 수행 policy를 학습하는 흐름과 연결된다. | demonstration dataset으로 imitation learning policy를 학습한다. | RFM 자체의 모델 유형을 뜻하는 용어가 아니라, policy/behavior 학습 방식이다. Behavior Cloning, Inverse Reinforcement Learning 등을 포함할 수 있음 |
| 14 | Reinforcement Learning | agent 또는 policy가 environment와 상호작용하며 action을 수행하고, 그 결과로 받은 reward, observation, done signal 등을 바탕으로 장기적인 보상을 높이도록 학습하는 방식이다.<br>정답 action label이나 demonstration이 충분하지 않은 task에서 유용하며, robotics에서는 안전성과 반복 비용 문제 때문에 simulation 기반 policy 학습과 함께 사용되는 경우가 많다. | simulation environment에서 robot policy를 reinforcement learning으로 학습한다. | RFM fine-tuning과 같은 foundation model 후속 학습과는 구분되는 policy/behavior 학습 방식이다. reward design, rollout, policy update와 연결 |
| 15 | Pre-training | 대규모 일반 data 또는 다양한 task data를 사용해 model의 기본 표현 능력과 범용 능력을 먼저 학습시키는 과정이다.<br>이후 특정 task나 domain에 맞춘 post-training 또는 fine-tuning의 기반이 될 수 있다. | 대규모 robot dataset으로 base model pre-training을 수행한다. | training의 초기 기반 학습 단계 |
| 16 | Post-training | 이미 pre-trained된 model을 특정 목적, task, domain, 안전성, 정렬성, 성능 개선을 위해 추가 학습하거나 조정하는 과정이다.<br>fine-tuning, preference tuning, instruction tuning 같은 여러 후속 학습 방식을 포함할 수 있다. | pre-trained model을 현장 task에 맞게 post-training한다. | pre-training 이후의 후속 학습 단계 |
| 17 | Fine-tuning | 이미 학습된 base model 또는 기존 model을 특정 task, robot, environment, dataset에 맞게 추가 학습하는 과정이다.<br>post-training의 대표 형태이며, Physical AI Platform에서는 생성/수집/정제된 dataset을 이용해 모델을 현장 작업에 맞게 조정하는 흐름을 의미할 수 있다. | 기존 robot policy model을 특정 task dataset으로 fine-tuning한다. | post-training의 대표 형태 |
| 18 | Model Evaluation | 학습되었거나 등록된 model 또는 policy의 성능과 품질을 기준에 따라 평가하는 과정이다.<br>benchmark, simulation, 성공률, task completion, latency, failure case, 사용자 검토 결과 등을 활용할 수 있다. | simulation에서 fine-tuned model evaluation을 수행한다. | 모델/정책 성능 판단 프로세스 |
| 19 | Model Registration | 학습되거나 외부에서 가져온 model을 플랫폼의 Model Manager 또는 model catalog에서 관리할 수 있도록 등록하는 과정이다.<br>model name, architecture, version, supported modality, training dataset, evaluation result, artifact 위치 같은 관리 metadata를 함께 기록할 수 있다. | fine-tuning 결과 model을 model registration으로 등록한다. | Model Manager 관리 진입점 |
| 20 | Model Optimization | model의 실행 효율, 크기, 속도, 비용을 개선하기 위해 구조나 파라미터 표현을 조정하는 과정이다.<br>quantization, distillation, pruning 같은 세부 기법을 포함할 수 있으며, 성능 저하 여부를 함께 확인해야 한다. | 학습된 model에 대해 model optimization을 수행한다. | 모델 운영/배포 전 프로세스 |
| 21 | Publish | dataset, model, artifact 등을 플랫폼 사용자나 다른 workflow에서 사용할 수 있도록 공개 또는 사용 가능 상태로 전환하는 과정이다.<br>내부 카탈로그 등록, 공유 범위 설정, 외부 hub 업로드 같은 흐름을 포함할 수 있다. | 검수 완료된 model version을 publish한다. | 운영 환경 반영인 deployment와 구분 |
| 22 | Deployment | model이나 policy를 실제 실행 환경, serving endpoint, robot 운영 환경 등에 반영하여 사용할 수 있게 하는 과정이다.<br>설치, 전송, endpoint 생성, 상태 추적, rollback 같은 운영 흐름을 포함할 수 있다. | fine-tuned model을 robot 실행 환경에 deployment한다. | publish보다 실행 환경 반영에 가까움 |

---

## 공통 플랫폼 용어

계정, 조직, 권한, 테넌트, 운영 관리와 관련된 공통 플랫폼 용어를 정의한다.

### 공통 플랫폼 용어 목록

| No | 용어 | 설명 | 사용 예시 | 비고 |
| --- | --- | --- | --- | --- |
| 1 | Tenant | 플랫폼 안에서 데이터, 모델, 자원, 권한이 논리적으로 분리되는 사용 주체 또는 격리 단위이다.<br>멀티테넌트 구조에서는 tenant별로 project, dataset, model, robot, workflow, artifact 접근 범위와 resource 사용 범위를 나눌 수 있다. | tenant별로 dataset과 model 접근 범위를 분리한다. | 멀티테넌트 격리 단위 |
| 2 | Organization | 여러 user와 project를 묶어 관리하는 조직 단위이다.<br>organization은 tenant와 동일하게 운영될 수도 있고, 하나의 tenant 안에서 부서나 팀 단위로 나뉠 수도 있다.<br>데이터, dataset, model, robot, workflow, artifact의 소유권과 접근 범위를 정의하는 기준으로 사용된다. | organization별로 project와 dataset 접근 권한을 분리한다. | 조직/소유권 관리 기준 |
| 3 | User | 플랫폼을 사용하는 개인 계정이다.<br>user는 organization에 소속될 수 있으며, 부여된 role이나 permission에 따라 project, dataset, model, robot, workflow, artifact를 생성, 조회, 실행, 관리할 수 있다. | user에게 model training 실행 권한을 부여한다. | 계정/권한 관리 단위 |
| 4 | Project Member | 특정 project에 소속된 user를 나타내는 연결 단위이다.<br>project member는 user와 project의 참여 관계를 관리하며, 해당 project의 data, dataset, model, workflow, artifact 등에 접근하거나 작업을 수행할 수 있는 기준으로 사용될 수 있다. | project에 DATA_ENGINEER user를 project member로 추가한다. | 현재 테이블 기준 role은 글로벌 user role에서 관리 |
| 5 | Work Item | project 안에서 project member가 처리하거나 추적해야 하는 업무 항목이다.<br>Jira issue와 유사하게 제목, 설명, 담당자, 상태, 예정 완료 시간, 완료 시간 등을 통해 프로젝트 진행에 필요한 일을 관리하는 단위로 사용할 수 있다.<br>상태값은 TODO, IN_PROGRESS, DONE, CANCELLED 등을 사용할 수 있다. | data preprocessing work item을 생성하고 담당 project member를 지정한다. | 화면/축약 용어로 Work 사용도 검토 가능 |
| 6 | Role | user에게 부여되는 플랫폼 역할 코드이다.<br>현재 플랫폼은 MODEL_USER, PROJECT_MANAGER, DATA_ENGINEER, MODEL_ENGINEER, SIMULATION_ENGINEER, BASE_MODEL_ADMIN, ROBOT_MANAGER, INFRA_ADMIN, PLATFORM_ADMIN의 9개 role을 정의하며, 한 user가 복수 role을 보유할 수 있다. | user에게 DATA_ENGINEER role과 MODEL_ENGINEER role을 부여한다. | common code ROLE 그룹의 code value |
| 7 | Role Group | role을 업무 성격에 따라 묶는 상위 분류이다.<br>현재 플랫폼은 CUSTOMER, DEVELOPMENT, SUPPORT, ADMIN role group을 정의하며, role group은 role 목록을 분류하거나 화면에서 권한 체계를 설명하는 데 사용할 수 있다. | DATA_ENGINEER role은 DEVELOPMENT role group에 속한다. | common code ROLE_GROUP 그룹의 code value |
| 8 | Permission | 특정 기능, 데이터, 모델, 자원에 대해 수행할 수 있는 행위 권한이다.<br>조회, 생성, 수정, 삭제, 실행, publish, deployment 같은 행위 단위로 정의될 수 있으며 role 또는 user에 직접 연결될 수 있다. | dataset delete permission을 관리자 role에만 부여한다. | 접근 제어의 최소 권한 단위 |
| 9 | Access Control | user, role, permission, organization, tenant 정보를 기준으로 플랫폼 자원과 기능에 대한 접근 가능 여부를 결정하는 관리 체계이다.<br>dataset, model, artifact, workflow, resource 등 다양한 대상에 대해 조회, 실행, 수정, 공유 범위를 제어한다. | access control 정책으로 project별 model 접근을 제한한다. | 권한 적용 체계 |
| 10 | Resource | workflow, job, execution을 수행하는 데 필요한 컴퓨팅 및 저장 자원이다.<br>CPU, GPU, memory, storage, network, cluster node 같은 인프라 요소를 포함할 수 있다. | training job에 필요한 GPU resource를 할당한다. | 실행 자원 상위 개념 |
| 11 | Resource Pool | 플랫폼에서 사용할 resource를 목적이나 소유 범위에 따라 묶어 관리하는 단위이다.<br>학습용, 시뮬레이션용, 평가용처럼 용도별로 구분하거나 tenant, organization, project별로 접근 가능한 자원 집합을 정의할 수 있다. | simulation 전용 resource pool을 생성한다. | 자원 할당/격리 단위 |
| 12 | Monitoring | job, execution, resource, dataset, model 상태와 사용 이력을 지속적으로 관찰하고 추적하는 운영 관리 개념이다.<br>실행 성공률, 평균 실행 시간, GPU 사용량, 저장소 사용량, 서비스 상태 등을 확인하는 기능이나 대시보드와 연결될 수 있다. | model training job monitoring으로 실행 상태를 확인한다. | 플랫폼 운영 관리 용어 |
| 13 | Notification | 플랫폼에서 사용자에게 전달하는 알림의 상위 개념이다.<br>job 상태 변경, work item 할당, 권한 변경, comment mention, 서비스 점검 공지, 장애 또는 resource 부족 경고처럼 사용자가 인지해야 하는 이벤트를 전달하는 데 사용된다. | job 실패 notification을 담당 project member에게 발송한다. | alarm, notice 성격의 알림을 포함 |
