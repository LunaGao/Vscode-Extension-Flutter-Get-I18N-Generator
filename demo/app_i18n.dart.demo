// GENERATED CODE - DO NOT MODIFY BY HAND

import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AppI18N extends Translations {
  @override
  Map<String, Map<String, String>> get keys {
    final keys = {
      'en': {'title': 'This is Title', 'hello': 'hello'},
      'zh_Hans': {'title': '这是title', 'hello': '喂'},
    };
    keys['zh_CN'] = keys['zh_Hans']!;
    keys['zh_TW'] = keys['zh_Hant']!;
    return keys;
  }

  Map<String, String> get key2DisplayValue => {
    'en': 'English',
    'zh_Hans': '简体中文',
  };

  Locale getSelectLocale() {
    var locale = Get.deviceLocale;
    if (locale == null) {
      return const Locale('en');
    } else {
      if (locale.languageCode == 'en') {
        return const Locale('en');
      }
      if (locale.languageCode == 'zh') {
        if (locale.scriptCode == 'Hant' ||
            locale.countryCode == 'TW' ||
            locale.countryCode == 'HK' ||
            locale.countryCode == 'MO') {
          return Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant');
        } else {
          return Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hans');
        }
      }
      return locale;
    }
  }
}
