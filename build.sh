#!/bin/sh
yarn stdver # 根据从上一版本到现在的 commits，更新 semver。会提交一个新的 commit 并打 tag
yarn build # 打包代码 & 产出文档
