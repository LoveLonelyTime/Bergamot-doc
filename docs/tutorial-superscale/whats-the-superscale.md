# 什么是超标量

超标量处理器的定义为 **在一个周期可以执行并完成多条指令的处理器, 即指令的最大吞吐量大于 1 指令/周期.**

:::danger 区别简单多周期处理器和超标量处理器

简单多周期处理器虽然能在一个周期同时执行多条指令, 但无法在一个周期完成多条指令, 完成一条指令是指从处理器中完成其功能并修改了核心的状态并从处理器中退出, 术语称为指令退休 (Retire).

简单多周期处理器的 IPC(指令数每周期) 一定小于等于 1, 而超标量处理器的 IPC 一定大于等于 2.

:::

下图展示了一种可能的 2-ways 超标量处理器在执行一段指令的过程:

![Superscale](./img/superscale.png)

在 2-ways 超标量处理器中, 一个最大的特点就是每 2 个紧邻的指令成组的执行.