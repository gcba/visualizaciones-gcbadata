import csv

file_name = 'censo-arbolado-2011.csv'
output_file = 'censo-arbolado-2011-edited.csv'
csv_file = open(file_name, 'r')
## note that the index of the year column is excluded
column_indices = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]
with open(output_file, 'w') as fh:
    reader = csv.reader(csv_file, delimiter=';')
    for row in reader:
      newRow = row[0:-1]

      fh.write(';'.join(newRow))


#       tmp_row = []
#       for col_inx in column_indices:
#           tmp_row.append(row[col_inx])
      # fh.write(';'.join(tmp_row))  