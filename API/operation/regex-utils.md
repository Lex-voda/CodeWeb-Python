# Regex for seq.puml process

## Fix returned messages arrow not dashed

Replace

```regex
(?=.*返回.*)\s->
```

with `- -`

## Strip operation layer non-related content

Delete

```regex
^(?!(.*OperationEnd|OpDatabaseEnd).*)(?=.*-.*).*$\n
```
<!-- ```regex
^(?!(.*OperationEnd|PreprocessModule|InferenceModule|TrainingModule).*)(?=.*-.*).*$\n
``` -->

## Strip notes

Delete

```regex
^.*note over[\s\S]*?end note$\n
```

```regex
^.*note right.*$\n
```

```regex
\[.*?\]
```

## Strip frontend non-related content

Delete

```regex
^(?!(.*Frontend).*)(?=.*-.*).*$\n
```