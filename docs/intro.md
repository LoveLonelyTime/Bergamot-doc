---
sidebar_position: 1
---

# 教程导入

5 分钟了解什么是 Bergamot.

![Bergamot social card](/img/bergamot-social-card.png)

## 项目简介

Bergamot 是一个基于 RV32GC 的超标量处理器实现.

与其他 RISC-V 开源实现不同, Bergamot 关注于超标量架构的通用处理器实现方法.

Bergamot 目前支持:

- 多级, 动态以及 2 路的超标量结构, 意味着理论最大指令吞吐量为 2 条指令/周期.
- 4 路并行的流水线处理单元, 包括 ALU, Branch, Memory, FPU.
- 动态分支预测.
- L1 (I/D) 和 L2 高速缓存系统.
- RISC-V 32GC 指令集架构.
- 支持主流 Linux 内核启动.
- 中断和内存映射式 I/O 子系统.
- 采用 AXI 总线, 连接多种外设.
- 可以运行在 FPGA 中.

如果你已经有单周期或多周期单流水 CPU 的设计经验, 想要了解和学习超标量处理器结构, 那么本项目正好适合您参与与学习.

## 快速开始

### 面对的人群

Bergamot 作为一种开源的 RISC-V 超标量处理器实现, 我们的目标是实现一个具有多功能组件并且可自由更改的处理器实现, 帮助读者理解现代处理器技术基础, 适用于教学与科研.

我们希望您在阅读本文档前, 应该有以下的知识储备和相关经验:

- 基本的数字电路知识, 至少应该熟练掌握使用 Verilog 组合电路和时序电路 (状态机) 的设计和开发流程.
- 有单周期和多周期单流水 CPU 的设计经验.
- 了解过超标量架构的相关内容.
- Scala 语言的使用 (基本的面向对象和函数式编程), Chisel 硬件描述框架的使用.

本文档会讲解:

- 一般超标量架构的相关内容.
- RISC-V IMACFA(GC) 指令集体系.
- Bergamot 设计思想.
- Bergamot 的使用方法.

本文档 **不会** 讲解:
- 如何编写 Scala 语言程序, 以及如何使用 Chisel 设计数字电路.
- RISC-V 程序的编写以及 RISC-V Linux 操作系统实现细节.
- 高级的现代处理器设计方案, 例如多核心.

### 需要什么?

- [Git](https://git-scm.com/) 是一个版本控制工具, 用来克隆我们的代码.
- [Mill](https://mill-build.org/mill/index.html) 是 Scala 项目构建工具, 可以自动帮助我们适配和下载 Scala 以及相关依赖版本.
- [Firtool](https://github.com/llvm/circt) 是 Chisel 的后端工具, 用于生成 Verilog 代码. 
- [Chisel](https://www.chisel-lang.org/) 是我们使用的硬件描述框架, 基于 Scala 语言开发.
- [Verilator](https://www.veripool.org/verilator/) 是一款开源、高性能的 RTL 级仿真器, 您也可以使用其他仿真器.
- [GCC for RISC-V](https://github.com/riscv-collab/riscv-gnu-toolchain) 是 RISC-V 的 GCC 交叉编译工具链.
- 如果您参与 FPGA 开发, 可能还需要例如 Vivado 等 FPGA 开发工具.

:::tip 版本问题

注意, Chisel 指定了某些工具的版本, 而不是使用其最新版本, 若版本不正确, 可能将导致运行出现未知错误.

Chisel 使用 Scala 2, 而不是 Scala 3.
:::

您绝大多数情况下无需自行构建环境, 我们为您提供了 Docker 镜像, 可以直接拉取所需要的工具.

```bash
# 目前镜像包含了所需要的 mill, verilator, dtc, riscv-gnu-toolchain, qemu 等构建工具
docker pull ghcr.io/lovelonelytime/bergamot-build:2026.5.12
```

此外，我们推荐您使用 VSCode 作为项目编辑器, VSCode 提供了 Dev Container, 执行命令 `Dev Containers: Open Folder in Container...`, 可以直接从 `.devcontainer` 创建开发容器.

### 启动项目

1. 克隆代码

```bash
git clone https://github.com/LoveLonelyTime/Bergamot
```

2. 构建项目

```bash
cd Bergamot
make verilogsim
```

`cd` 命令确保您的工作目录位于我们的项目目录下.

`make verilogsim` 是我们所编写的 make 构建命令, 最终会调用 Mill 的构建命令, Mill 会帮助我们适配并下载合适的 Scala 版本. 如果您第一次构建 Chisel 项目, 该命令可能需要较长的时间从互联网下载相关工具链和代码包, 请在网络良好的环境下执行该命令.

该过程可能时间较久, 请稍作等待, 若您没有遇到错误, 项目将会在项目的根目录下生成以下文件:

- `build/sim/*.sv` 描述测试内核的 System Verilog 文件.

3. 构建 Verilator 测试程序

我们的 Verilator 测试程序将在 `simulator` 目录下面进行.

```bash
cd simulator
make
```

`make` 将使用我们预定义的 Makefile 文件进行构建, 将上一步得到的 System Verilog 文件, 最终编译为可执行的仿真模型.

该过程同样可能时间较久, 请稍作等待. 构建完成之后, 若您没有遇到错误, 项目将在 `obj_dir` 目录下生成 `VVerilatorTestCore` 二进制可执行文件, 该文件即为我们最终的仿真程序.

5. 运行 Verilator 测试程序

`VVerilatorTestCore` 可直接在终端内执行, 该程序的用法为:

```plain
Usage: VVerilatorTestCore [+trace] +B<binary file> [+D<device tree file>] [+T<timeout>] [+W<write host>]
    +trace : 输出 VCD 波形文件.
    +B<binary file> : 要仿真执行具有 RISC-V 指令的二进制程序文件.
    +D<device tree file> : 要使用的设备树文件 (.dtb).
    +T<timeout> : 最大测试周期, 不设置则无限仿真时间.
    +W<write host> : riscv-tests 程序的 Write Host 内存地址 (16进制).
```

使用例子:

```bash
./obj_dir/VVerilatorTestCore +trace +Bprog.bin +Dsim_dt.dtb +T10000 +W80000000
```

## 接下来的路程

恭喜您🎉, 完成了 Bergamot 的项目构建, 接下来的教程中, 您将学习怎样编译 RISC-V 程序 (甚至是 Linux 内核), 开启 Bergamot 学习路程.
