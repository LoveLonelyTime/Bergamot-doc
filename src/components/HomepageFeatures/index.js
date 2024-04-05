import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'RISC-V',
    Svg: require('@site/static/img/riscv-color.svg').default,
    description: (
      <>
        Bergamot 基于开放 <em>RISC-V 32GC(IMACFD)</em> 指令集, 打造通用 RISC-V 处理器, 采用 2-way 多级并行流水线超标量结构, 支持指令动态调度.
      </>
    ),
  },
  {
    title: 'Chisel',
    Svg: require('@site/static/img/chisel_logo.svg').default,
    description: (
      <>
        Chisel, 是一个基于 Scala 的硬件描述语言, 为硬件描述提供面向对象和函数式编程两种工具, 使得硬件开发更加快捷方便.
      </>
    ),
  },
  {
    title: 'Linux',
    Svg: require('@site/static/img/linux_logo.svg').default,
    description: (
      <>
        Bergamot 采用 Sv32 MMU 分页方案, 采用 OpenSBI 直接引导或采用 U-Boot 引导, 启动主流 Linux 6.8 内核.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
