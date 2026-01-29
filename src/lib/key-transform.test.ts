import {
  snakeToCamel,
  camelToSnake,
  snakeToPascal,
  transformKeys,
  transformJsonKeys,
  transformJsonString,
  getTransformTypeLabel,
} from "./key-transform";

describe("snakeToCamel", () => {
  it("converts snake_case to camelCase", () => {
    expect(snakeToCamel("user_name")).toBe("userName");
    expect(snakeToCamel("first_name")).toBe("firstName");
    expect(snakeToCamel("created_at")).toBe("createdAt");
  });

  it("handles keys with numbers", () => {
    expect(snakeToCamel("user_id_2")).toBe("userId2");
    expect(snakeToCamel("item_1_name")).toBe("item1Name");
  });

  it("handles single word", () => {
    expect(snakeToCamel("name")).toBe("name");
    expect(snakeToCamel("id")).toBe("id");
  });

  it("handles empty or invalid input", () => {
    expect(snakeToCamel("")).toBe("");
    expect(snakeToCamel(null as unknown as string)).toBe(null);
    expect(snakeToCamel(undefined as unknown as string)).toBe(undefined);
  });

  it("handles multiple underscores", () => {
    // 连续下划线：第一个下划线被处理，后续保留
    expect(snakeToCamel("user__name")).toBe("user_Name");
    expect(snakeToCamel("a_b_c_d")).toBe("aBCD");
  });

  it("handles leading/trailing underscores", () => {
    // 前导下划线：下划线后的字符大写
    expect(snakeToCamel("_user_name")).toBe("UserName");
    // 尾随下划线：保留（因为后面没有字符可转换）
    expect(snakeToCamel("user_name_")).toBe("userName_");
  });
});

describe("camelToSnake", () => {
  it("converts camelCase to snake_case", () => {
    expect(camelToSnake("userName")).toBe("user_name");
    expect(camelToSnake("firstName")).toBe("first_name");
    expect(camelToSnake("createdAt")).toBe("created_at");
  });

  it("converts PascalCase to snake_case", () => {
    expect(camelToSnake("UserName")).toBe("user_name");
    expect(camelToSnake("FirstName")).toBe("first_name");
  });

  it("handles keys with numbers", () => {
    expect(camelToSnake("userId2")).toBe("user_id_2");
    expect(camelToSnake("item1Name")).toBe("item_1_name");
  });

  it("handles consecutive uppercase letters", () => {
    expect(camelToSnake("HTMLParser")).toBe("html_parser");
    expect(camelToSnake("XMLHttpRequest")).toBe("xml_http_request");
    expect(camelToSnake("getHTTPResponse")).toBe("get_http_response");
  });

  it("handles single word", () => {
    expect(camelToSnake("name")).toBe("name");
    expect(camelToSnake("ID")).toBe("id");
  });

  it("handles empty or invalid input", () => {
    expect(camelToSnake("")).toBe("");
    expect(camelToSnake(null as unknown as string)).toBe(null);
    expect(camelToSnake(undefined as unknown as string)).toBe(undefined);
  });
});

describe("snakeToPascal", () => {
  it("converts snake_case to PascalCase", () => {
    expect(snakeToPascal("user_name")).toBe("UserName");
    expect(snakeToPascal("first_name")).toBe("FirstName");
    expect(snakeToPascal("created_at")).toBe("CreatedAt");
  });

  it("handles keys with numbers", () => {
    expect(snakeToPascal("user_id_2")).toBe("UserId2");
    expect(snakeToPascal("item_1_name")).toBe("Item1Name");
  });

  it("handles single word", () => {
    expect(snakeToPascal("name")).toBe("Name");
    expect(snakeToPascal("id")).toBe("Id");
  });

  it("handles empty or invalid input", () => {
    expect(snakeToPascal("")).toBe("");
    expect(snakeToPascal(null as unknown as string)).toBe(null);
    expect(snakeToPascal(undefined as unknown as string)).toBe(undefined);
  });
});

describe("transformKeys", () => {
  it("transforms keys in simple object", () => {
    const input = { user_name: "John", user_age: 30 };
    const result = transformKeys(input, snakeToCamel);
    expect(result).toEqual({ userName: "John", userAge: 30 });
  });

  it("transforms keys in nested object", () => {
    const input = {
      user_info: {
        first_name: "John",
        last_name: "Doe",
      },
    };
    const result = transformKeys(input, snakeToCamel);
    expect(result).toEqual({
      userInfo: {
        firstName: "John",
        lastName: "Doe",
      },
    });
  });

  it("transforms keys in deeply nested object", () => {
    const input = {
      user_info: {
        contact_details: {
          phone_number: "123",
          email_address: "test@example.com",
        },
      },
    };
    const result = transformKeys(input, snakeToCamel);
    expect(result).toEqual({
      userInfo: {
        contactDetails: {
          phoneNumber: "123",
          emailAddress: "test@example.com",
        },
      },
    });
  });

  it("transforms keys in array of objects", () => {
    const input = {
      order_list: [
        { order_id: 1, created_at: "2024-01-01" },
        { order_id: 2, created_at: "2024-01-02" },
      ],
    };
    const result = transformKeys(input, snakeToCamel);
    expect(result).toEqual({
      orderList: [
        { orderId: 1, createdAt: "2024-01-01" },
        { orderId: 2, createdAt: "2024-01-02" },
      ],
    });
  });

  it("handles empty object", () => {
    expect(transformKeys({}, snakeToCamel)).toEqual({});
  });

  it("handles empty array", () => {
    expect(transformKeys([], snakeToCamel)).toEqual([]);
  });

  it("handles null and undefined", () => {
    expect(transformKeys(null, snakeToCamel)).toBe(null);
    expect(transformKeys(undefined, snakeToCamel)).toBe(undefined);
  });

  it("handles primitive types", () => {
    expect(transformKeys("string", snakeToCamel)).toBe("string");
    expect(transformKeys(123, snakeToCamel)).toBe(123);
    expect(transformKeys(true, snakeToCamel)).toBe(true);
  });

  it("handles mixed arrays", () => {
    const input = [{ user_name: "John" }, "string", 123, null];
    const result = transformKeys(input, snakeToCamel);
    expect(result).toEqual([{ userName: "John" }, "string", 123, null]);
  });

  it("preserves null values in objects", () => {
    const input = { user_name: null, user_age: 30 };
    const result = transformKeys(input, snakeToCamel);
    expect(result).toEqual({ userName: null, userAge: 30 });
  });
});

describe("transformJsonKeys", () => {
  it("transforms with snakeToCamel type", () => {
    const input = { user_name: "John" };
    const result = transformJsonKeys(input, "snakeToCamel");
    expect(result).toEqual({ userName: "John" });
  });

  it("transforms with camelToSnake type", () => {
    const input = { userName: "John" };
    const result = transformJsonKeys(input, "camelToSnake");
    expect(result).toEqual({ user_name: "John" });
  });

  it("transforms with snakeToPascal type", () => {
    const input = { user_name: "John" };
    const result = transformJsonKeys(input, "snakeToPascal");
    expect(result).toEqual({ UserName: "John" });
  });
});

describe("transformJsonString", () => {
  it("parses, transforms, and stringifies JSON", () => {
    const input = '{"user_name":"John","user_age":30}';
    const result = transformJsonString(input, "snakeToCamel");
    expect(JSON.parse(result)).toEqual({ userName: "John", userAge: 30 });
  });

  it("formats output with indentation", () => {
    const input = '{"user_name":"John"}';
    const result = transformJsonString(input, "snakeToCamel");
    expect(result).toBe('{\n  "userName": "John"\n}');
  });

  it("throws on invalid JSON", () => {
    expect(() => transformJsonString("invalid", "snakeToCamel")).toThrow();
  });
});

describe("getTransformTypeLabel", () => {
  it("returns Chinese label for each type", () => {
    expect(getTransformTypeLabel("snakeToCamel")).toBe("蛇形转驼峰");
    expect(getTransformTypeLabel("camelToSnake")).toBe("驼峰转蛇形");
    expect(getTransformTypeLabel("snakeToPascal")).toBe("蛇形转帕斯卡");
  });
});
