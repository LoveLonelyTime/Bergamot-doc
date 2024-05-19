---
sidebar_position: 1
---

# 运行 C 语言程序

本文将通过实例使用 Bergamot 运行使用 C 语言编写的实例.

## 准备

### 下载 Bergamot

首先, 我们需要下载并准备 Bergamot 环境, 您可以参考 [教程导入](docs\intro.md) 的安装过程.

当您能够成功编译 Verilator 测试程序 `VVerilatorTestCore` 说明 Bergamot 已经准备完毕.

### 安装 RISC-V GCC 交叉编译器

要想编译您的 C 的程序到 RISC-V 二进制可执行程序，您需要安装 RISC-V 官方为您提供的 RISC-V GCC 交叉编译器. 该项目的地址为 [riscv-gnu-toolchain](https://github.com/riscv-collab/riscv-gnu-toolchain) .

关于架构模型, 由于 Bergamot 目前使用 RV32 并且浮点 FPU 并不完善, 我们推荐您使用:

```shell
./configure --prefix=/opt/riscv --with-arch=rv32gc --with-abi=ilp32 --enable-multilib
```

参数 `--prefix=/opt/riscv` 指明安装地址, `--with-arch=rv32gc` 指明我们使用 `rv32gc` 扩展, `--with-abi=ilp32` 适用于 32 位软浮点, `--enable-multilib` 包含软浮点库.

:::tip 选择已编译的二进制版本

编译 `riscv-gnu-toolchain` 需要下载很多相关依赖, 这些依赖通常体积非常大且编译耗时长, 您可以直接使用 bootlin 提供的已编译的二进制版本 [bootlin](https://toolchains.bootlin.com/) .

:::

## 编译 Bootloader 启动程序

对于测试核心 `VerilatorTestCore` 的启动地址为 `hffff0000`, 该地址正好处于 ROM , 测试核心将在这里首先启动 Bootloader 程序, 这在以下代码中配置:

```scala title="src/main/scala/bergamot/export/VerilatorTestCore.scala"
private class VerilatorTestCore extends Module {
  private val config = CoreConfig.default.copy(pcInit = "hffff0000")
  // ...
}
```

对于测试核心的地址映射, 在下面的代码文件中进行配置:

```scala title="src/main/scala/bergamot/export/VerilatorTestCore.scala"
private val interconnect = Module(
  new AXIInterconnect(
    Seq(
      "h00000000", // hole
      "h2000000", // mtime
      "h10000000", // uart
      "h80000000", // ram
      "hffff0000" // rom
    )
  )
)
```

`VerilatorTestCore` 启动时, 将加载工作目录下的 `boot.hex` 文件到 ROM, 该文件符合 verilog 所定义的hex文件格式. 一个 Bootloader 启动程序的例子为:

```asm
.text
.globl	_start

/* . = 0xffff0000; */
_start:
li a0, 0x80000000 /* Entry point */
jalr ra, 0(a0) /* Go */
```

上述代码中, 将启动地址 `0x80000000` 加载到寄存器 `a0` 中, 然后通过 `jalr` 指令开始执行地址 `0x80000000` 处的代码, 此地址正好是虚拟 DRAM 的地址.

通过编译器得到的二进制机器码为:

```plain
80000537
000500e7
00000000
00000000
00000000
00000000
```

将上述内容以 **文本** 的形式直接保存在 `simulator` 文件夹下的 `boot.hex` 文件即可.

## 编译测试 C 语言测试程序

现在, 编写您的测试 C 语言测试程序, 下面是一个简单的例子:

```c
void main()
{
    int *out = (int *)0x80010000;
    int a = 0;
    for (int i = 1; i <= 10; i++)
    {
        a += i;
    }
    *out = a;

    while (1)
        ;
}
```

该程序将计算 1 到 10 的累加和, 并存到内存 `0x80010000` 处以供我们检查结果.

因为我们编写的是裸机程序, 编译器无法定位 `main` 方法, 我们需要手动编写入口程序:

```asm
.text
.globl	_start

_start:
li sp, 0x80011000
j main
```

该代码设置栈的地址为 `0x80011000` , 设置栈是必须的, 否则我们将无法调用 C 语言函数. 最后我们需要编写链接器脚本, 告诉编译器如何编排内存布局:

```lds
OUTPUT_ARCH("riscv")
OUTPUT_FORMAT("elf32-littleriscv")

ENTRY(_start)

SECTIONS {
    . = 0x80000000;
    .text : { *(.text) }
    _end = .;
}
```

这将告诉编译器我们将代码加载到内存 `0x80000000` 处开始执行.

最后使用 `gcc` 命令编译:

```shell
riscv32-unknown-linux-gnu-gcc -march=rv32gc -mabi=ilp32 -static -mcmodel=medany -fvisibility=hidden -nostdlib -nostartfiles -Ttest.lds load.s acc.c -o acc
```

其中 `test.lds` 为链接器脚本, `load.s` 是启动入口程序, `acc.c` 是我们编写的 C 语言源文件, 最后您将得到 `acc` 文件说明一切进展顺利.

:::warning 使用全局变量

我们的实例程序没有全局变量, 若您想使用全局变量则必须手动编写 `bss` 段和 `data` 段的清空和初始化程序, 并且需要在链接器脚本中指明如何编排这两个段, 最后可能需要设置 `gp` 寄存器的指向.

:::

最后, 我们得到的 `acc` 文件的二进制格式为 `elf`, 但这并不是我们想要的, `VerilatorTestCore` 需要的是原始二进制格式, 其将会把该文件的内容按照 **二进制** 原封不动的加载进内存 `0x80000000` 处. 在那之前, 您可以通过反编译查看我们的 `acc` 文件结果是否正确:

```shell
riscv32-unknown-linux-gnu-objdump -d acc > acc.txt
```

这是我生成的部分代码, 其中每一行指明了指令在内存中的地址, 以及二进制指令码, 最后是反编译的结果:

```plain
test:     file format elf32-littleriscv

Disassembly of section .text:

80000000 <_start>:
80000000:	80011137          	lui	sp,0x80011
80000004:	0040006f          	j	80000008 <main>

80000008 <main>:
80000008:	1101                	add	sp,sp,-32 # 80010fe0 <_end+0x10f90>
8000000a:	ce22                	sw	s0,28(sp)
8000000c:	1000                	add	s0,sp,32
8000000e:	800107b7          	lui	a5,0x80010
......
```

现在通过下面的命令, 导出 `elf` 文件中的 `text` 段到二进制文件中:

```shell
riscv32-unknown-linux-gnu-objcopy -O binary -j .text acc acc.bin
```

得到了 `acc.bin` 文件, 可以通过二进制工具打开, 该文件的第一个 4 字节应该是 `80011137` 对应我们第一条指令. 将该文件复制到 `simulator` 文件夹中, 现在 `simulator` 的内容应该有:

```plain
boot.hex -- ROM Bootloader 程序
acc.bin -- RISC-V 测试程序
obj_dir/VVerilatorTestCore -- VerilatorTestCore 测试程序
```

## 运行 VerilatorTestCore

在 `simulator` 文件夹下, 运行下面的命令:

```shell
./obj_dir/VVerilatorTestCore +trace +Bacc.bin +T10000
```

可以看到控制台会飞速打印我们的运行日志, 运行到 10000 周期后程序退出. 程序退出后会将最后的内存导出到 `mem.bin` 文件中, 使用二进制编辑器打开, 检查地址 `0x80010000` 的值, 若是 55 说明我们的程序运行成功. 另外在文件 `logs/vlt_dump.vcd` 会以 VCD 格式导出波形图方便您调试.
