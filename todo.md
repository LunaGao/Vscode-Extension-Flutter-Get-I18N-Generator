# TODO

基于当前整个项目代码、配置和测试结构整理。`npm run compile` 与 `npm run lint` 当前可通过，但这并不代表实现稳定，主要问题集中在文本处理、代码生成、错误可见性和测试缺失。

## P0

- [ ] 修复文件读取的文本解码方式  
涉及：`src/csv_and_dart_filesystem.ts`、`src/ios/ios_generator.ts`  
当前直接对 `vscode.workspace.fs.readFile()` 返回值调用 `.toString()`，这依赖运行时是否恰好返回 `Buffer`，实现上不稳。应统一改为 `new TextDecoder('utf-8').decode(bytes)` 或 `Buffer.from(bytes).toString('utf8')`，避免 CSV 和 iOS 字符串文件在不同环境下被错误解码。

- [ ] 修复 Dart 代码生成中的字符串转义不完整问题  
涉及：`src/generator.ts`  
现在只转义了单引号，没有处理反斜杠、换行、回车、`$` 插值符等情况。遇到特殊文本时，生成的 `app_i18n.dart` 可能直接编译失败或展示异常。建议抽出专门的 Dart string escape 方法。

- [ ] 为空文件、缺列、坏格式 CSV 增加结构校验  
涉及：`src/csv_and_dart_filesystem.ts`、`src/generator.ts`、`src/ios/ios_generator.ts`  
当前大量逻辑默认 `content[0]`、`row[0]`、`split('|')[1]` 一定存在。需要在读取后先校验：
 是否存在表头；
 是否存在 `key` 列；
 语言列格式是否满足 `locale|name[tag]`；
 是否存在 `title` 行。

- [ ] 修复 iOS 写文件未 `await` 的异步遗漏  
涉及：`src/ios/ios_generator.ts`  
`saveTitleIntoStringsFile()` 内部调用 `vscode.workspace.fs.writeFile()` 时没有 `await`，可能导致写入竞争、异常丢失或进度提示提前结束。

## P1

- [ ] 用明确类型替代 `object[]` 和 `String`  
涉及：几乎全部 `src/` 文件  
建议引入统一模型，例如：
 `type CsvRow = string[]`
 `type CsvTable = string[][]`
 `type LocaleHeader = { locale: string; displayName: string; tags: string[] }`
这样可以显著减少强制断言、重复 `split()` 和隐式空值问题。

- [ ] 重构 `generateDartFile()`，避免模板字符串反复 `replace()`  
涉及：`src/generator.ts`  
当前实现可读性差，且是典型的易错字符串拼装。建议改成先构造中间数据结构，再用数组 `map/join` 输出，逻辑会更清晰，也更容易单元测试。

- [ ] 提升错误输出质量，加入 `OutputChannel`  
涉及：`src/extension.ts`、`src/ios/ios_generator.ts`  
目前用户只能看到笼统的 `showErrorMessage()`，排查问题成本高。建议增加专用输出面板，记录：
 当前文件；
 失败模块；
 哪一行/哪一列出错。

- [ ] 提炼配置读取与命令处理逻辑，减少 `extension.ts` 里的重复代码  
涉及：`src/extension.ts`  
几个命令的交互和配置写入流程高度相似，建议拆成：
 配置访问层；
 用户提示层；
 保存触发器执行层。

- [ ] iOS 语言映射逻辑应统一封装，减少三段重复查找  
涉及：`src/ios/ios_generator.ts`  
当前 Runner 和 Fastlane 都在做相似的 locale 匹配，而且 fallback 规则分散。建议抽成统一函数，集中处理：
 `zh_CN -> zh-CN`
 `nb -> no`
 `en_US -> en`
 `en_US -> en-US`
 等映射策略。

- [ ] 修复和收敛正则/字符串替换的脆弱实现  
涉及：`src/ios/ios_generator.ts`  
`/"CFBundleDisplayName"[ ]+=[ ]+"(.*)";/` 是贪婪匹配，遇到复杂字符串不稳。建议使用非贪婪匹配或逐行解析。

- [ ] 清理发布包和工程元数据  
涉及：`package.json`、仓库根目录  
当前 `repository` 与 `description` 字段语义反了，仓库里还存在 `.vsix` 二进制产物。建议：
 修正扩展元数据；
 从仓库移除发布产物；
 用发布脚本或 CI 生成 `.vsix`。

## P2

- [ ] 补齐真正有价值的单元测试和集成测试  
涉及：`src/test/` 及核心模块  
现在只有一个示例测试，基本无法覆盖真实风险。优先补：
 `generateDartFile()` 的转义和 locale 输出；
 `GeneratorIOS` 的语言匹配与文件写入。

- [ ] 打开更严格的 TypeScript 编译选项  
涉及：`tsconfig.json`  
建议逐步启用：
 `noImplicitReturns`
 `noUnusedLocals`
 `noUnusedParameters`
 `noFallthroughCasesInSwitch`
 `exactOptionalPropertyTypes`

- [ ] 更新 ESLint 配置并统一代码风格  
涉及：`.eslintrc.json`  
当前规则偏弱，且 `ecmaVersion` 仍是 6。建议升级为与当前 TypeScript/Node 版本匹配的配置，并加入更实用的规则，如禁止无用 `var`、要求显式错误处理、限制 `any`/宽泛对象类型。

- [ ] 把公共逻辑拆成纯函数，降低 VS Code API 耦合  
涉及：`src/generator.ts`、`src/ios/ios_generator.ts`  
目前很多逻辑和 `vscode.workspace.fs`、命令交互混在一起，不利于测试。建议把解析、映射、转义、分组等逻辑抽到无副作用函数中。

- [ ] 完善 README，明确 CSV 规范与异常行为  
涉及：`README.md`  
建议补充：
 `[base]` 的精确定义；
 允许的 locale 格式；
 iOS 同步功能的目录前提；
 自动生成会在什么时机改写 `app_i18n.dart`。

- [ ] 增加最基本的 CI 校验  
涉及：仓库根目录  
建议至少在 CI 中执行：
 `npm ci`
 `npm run compile`
 `npm run lint`
 `npm test`
并阻止带有明显缺陷的版本被发布。
