using System;
using System.Collections.Generic;
using System.Data;
using MySql.Data.MySqlClient;

public static class Db
{
    // XAMPP/OpenServer: пользователь root, пароль обычно пустой.
    // Если у вас другой пароль — впишите его после Pwd=
    const string ConnStr =
        "Server=localhost;Port=3306;Database=mini_access;Uid=root;Pwd=;CharSet=utf8mb4;";

    static MySqlConnection Open()
    {
        var c = new MySqlConnection(ConnStr);
        c.Open();
        return c;
    }

    public static List<string> ListTables()
    {
        var list = new List<string>();
        using var con = Open();
        var cmd = new MySqlCommand("SHOW TABLES", con);
        using var r = cmd.ExecuteReader();
        while (r.Read()) list.Add(r.GetString(0));
        return list;
    }

    public class Column { public string Name, Type; public bool IsPk; }

    public static List<Column> GetSchema(string table)
    {
        var cols = new List<Column>();
        using var con = Open();
        var cmd = new MySqlCommand("SHOW COLUMNS FROM `" + table + "`", con);
        using var r = cmd.ExecuteReader();
        while (r.Read())
            cols.Add(new Column
            {
                Name = r.GetString("Field"),
                Type = r.GetString("Type"),
                IsPk = r.GetString("Key") == "PRI"
            });
        return cols;
    }

    public static string GetPk(string table)
    {
        foreach (var c in GetSchema(table)) if (c.IsPk) return c.Name;
        return null;
    }

    public static void CreateTable(string name, List<Column> cols)
    {
        var defs = new List<string>();
        string pkName = null;
        foreach (var c in cols)
        {
            defs.Add("`" + c.Name + "` " + c.Type);
            if (c.IsPk) pkName = c.Name;
        }
        if (pkName != null) defs.Add("PRIMARY KEY(`" + pkName + "`)");
        using var con = Open();
        var cmd = new MySqlCommand(
            "CREATE TABLE `" + name + "` (" + string.Join(", ", defs) + ")", con);
        cmd.ExecuteNonQuery();
    }

    public static DataTable GetRows(string table)
    {
        var dt = new DataTable();
        using var con = Open();
        var da = new MySqlDataAdapter("SELECT * FROM `" + table + "`", con);
        da.Fill(dt);
        return dt;
    }

    public static void InsertRow(string table, Dictionary<string, string> values)
    {
        using var con = Open();
        var keys = new List<string>(values.Keys);
        var names = new List<string>();
        var parms = new List<string>();
        for (int i = 0; i < keys.Count; i++)
        {
            names.Add("`" + keys[i] + "`");
            parms.Add("@p" + i);
        }
        var cmd = new MySqlCommand(
            "INSERT INTO `" + table + "` (" + string.Join(",", names) + ") " +
            "VALUES (" + string.Join(",", parms) + ")", con);
        for (int i = 0; i < keys.Count; i++)
            cmd.Parameters.AddWithValue("@p" + i,
                string.IsNullOrEmpty(values[keys[i]]) ? (object)DBNull.Value : values[keys[i]]);
        cmd.ExecuteNonQuery();
    }

    public static void DeleteRow(string table, string pkCol, object pkValue)
    {
        using var con = Open();
        var cmd = new MySqlCommand(
            "DELETE FROM `" + table + "` WHERE `" + pkCol + "` = @pk", con);
        cmd.Parameters.AddWithValue("@pk", pkValue);
        cmd.ExecuteNonQuery();
    }
}
